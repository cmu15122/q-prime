import { internalMutation, QueryCtx } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Doc, Id } from './_generated/dataModel';

export async function getGlobalSettings(ctx: QueryCtx) {
  const globalSettings = await ctx.db.query('globalSettings').first();
  if (!globalSettings) {
    throw new ConvexError('Global settings not found');
  }
  return globalSettings;
}

export async function getCurrentSemester(ctx: QueryCtx) {
  const globalSettings = await getGlobalSettings(ctx);
  const curr_sem = (await ctx.db.get(globalSettings.curr_sem))!;
  return curr_sem;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const user_id = await getAuthUserId(ctx);

  if (!user_id) {
    return null;
  }

  const user_data = (await ctx.db.get(user_id))!;
  const curr_sem = await getCurrentSemester(ctx);

  const curr_sem_user = (await ctx.db
    .query('semesterUsers')
    .withIndex('by_sem_and_user', (q) =>
      q.eq('semester_id', curr_sem._id).eq('user_id', user_id)
    )
    .first())!;

  // TODO - make sure we create new sem users for old users on first login of new sem

  const user_prefs = (await ctx.db.get(curr_sem_user.user_prefs_id))!;

  return {
    ...user_data,
    preferred_name: user_prefs.preferred_name,
    sem_user_id: curr_sem_user._id,
    kind: curr_sem_user.kind,
  };
}

export async function getQueueLength(ctx: QueryCtx) {
  const queue_length = await ctx.db.query('ohq').collect();
  return queue_length.length;
}

export async function getQueueEntry(ctx: QueryCtx, student_id: Id<'students'>) {
  const queue_entry = await ctx.db
    .query('ohq')
    .withIndex('by_student', (q) => q.eq('student_id', student_id))
    .first();

  if (!queue_entry) {
    throw new ConvexError('Queue entry not found');
  }

  return queue_entry;
}

export const createStudentFromUser = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user_data = (await ctx.db.get(args.userId))!;

    // create student prefs
    const new_student_prefs = await ctx.db.insert('userPreferences', {
      user_id: args.userId,
      preferred_name: user_data.name,
    });

    const curr_sem = await getCurrentSemester(ctx);

    // create sem user
    const new_sem_user = await ctx.db.insert('semesterUsers', {
      user_id: args.userId,
      user_prefs_id: new_student_prefs,
      semester_id: curr_sem._id,
      kind: 'student',
    });

    const new_student = await ctx.db.insert('students', {
      user_id: args.userId,
      user_prefs_id: new_student_prefs,
      semester_user_id: new_sem_user,
      num_questions: 0,
      time_on_queue_ms: 0,
      num_asked_to_fix: 0,
    });

    return new_student;
  },
});

// update queue positions (every student after the removed student moves up one position except frozen students)
export const removeQueueEntry = internalMutation({
  args: {
    queue_entry_id: v.id('ohq'),
  },
  handler: async (ctx, args) => {
    const queue_entry = (await ctx.db.get(args.queue_entry_id))!;

    const position_to_remove = queue_entry.position;

    await ctx.db.delete(queue_entry._id);

    const all_greater_queue_entries = await ctx.db
      .query('ohq')
      .withIndex('by_position', (q) => q.gt('position', position_to_remove))
      .order('asc')
      .collect();

    // we're gonna operate on the array and then use it to write data back to the DB
    let prev_num_frozen = 0;
    for (const q of all_greater_queue_entries) {
      if (
        q.status === 'frozen' ||
        q.status === 'cooldown_violation' ||
        q.status === 'fixing_question'
      ) {
        prev_num_frozen++;
      } else {
        await ctx.db.patch(q._id, {
          position: q.position - 1 - prev_num_frozen,
        });
        prev_num_frozen = 0;
      }
    }

    // if there are frozen students at the end of the queue, we need to shift them up
    if (prev_num_frozen > 0) {
      // dealing with all_greater_queue_entries[-prev_num_frozen:]
      for (const q of all_greater_queue_entries.slice(-prev_num_frozen)) {
        if (
          q.status !== 'frozen' &&
          q.status !== 'cooldown_violation' &&
          q.status !== 'fixing_question'
        ) {
          throw new ConvexError(
            'non-frozen student found at the end of the queue with prev_num_frozen > 0'
          );
        }

        await ctx.db.patch(q._id, { position: q.position - 1 });
      }
    }

    return;
  },
});

/**
 * Get a TA from their sem_user_id
 * @param ctx
 * @param sem_user_id
 * @returns
 */
export async function getTA(ctx: QueryCtx, sem_user_id: Id<'semesterUsers'>) {
  const ta = await ctx.db
    .query('tas')
    .withIndex('by_semuser', (q) => q.eq('semester_user_id', sem_user_id))
    .first();

  if (!ta) {
    throw new ConvexError('TA not found');
  }

  return ta;
}

export async function ensureAuthAndTA(
  ctx: QueryCtx
): Promise<{ user_data: Doc<'users'>; ta: Doc<'tas'> }> {
  const user_data = await getCurrentUser(ctx);

  if (!user_data) {
    throw new ConvexError('User not authenticated');
  }

  if (user_data.kind !== 'TA') {
    throw new ConvexError('User is not a TA');
  }

  const ta = await getTA(ctx, user_data.sem_user_id);

  if (!ta) {
    throw new ConvexError('TA not found');
  }

  return {
    user_data: user_data,
    ta: ta,
  };
}

export async function ensureAuthAndAdmin(
  ctx: QueryCtx
): Promise<{ user_data: Doc<'users'>; ta: Doc<'tas'> }> {
  const { user_data, ta } = await ensureAuthAndTA(ctx);

  if (!ta.is_admin) {
    throw new ConvexError('User is not an admin');
  }

  return { user_data: user_data, ta: ta };
}

/**
 * Get a student from their sem_user_id
 * @param ctx
 * @param sem_user_id
 * @returns
 */
export async function getStudent(
  ctx: QueryCtx,
  sem_user_id: Id<'semesterUsers'>
) {
  const student = await ctx.db
    .query('students')
    .withIndex('by_semuser', (q) => q.eq('semester_user_id', sem_user_id))
    .first();

  if (!student) {
    throw new ConvexError('Student not found');
  }

  return student;
}

export async function ensureAuthAndStudent(
  ctx: QueryCtx
): Promise<{ user_data: Doc<'users'>; student: Doc<'students'> }> {
  const user_data = await getCurrentUser(ctx);

  if (!user_data) {
    throw new ConvexError('User not authenticated');
  }

  if (user_data.kind !== 'student') {
    throw new ConvexError('User is not a student');
  }

  const student = await getStudent(ctx, user_data.sem_user_id);

  if (!student) {
    throw new ConvexError('Student not found');
  }

  return {
    user_data: user_data,
    student: student,
  };
}
