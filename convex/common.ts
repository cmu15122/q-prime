import { internalMutation, internalQuery, QueryCtx } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Doc, Id } from './_generated/dataModel';

export async function getGlobalSettings(ctx: QueryCtx) {
  const globalSettings = await ctx.db.query('globalSettings').unique();
  if (!globalSettings) {
    throw new ConvexError('Global settings not found');
  }
  return globalSettings;
}

export const internalGetGlobalSettings = internalQuery({
  args: {},
  handler: async (ctx, args) => {
    return await getGlobalSettings(ctx);
  },
});

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
    .withIndex('by_sem_and_user', (q) => q.eq('semester_id', curr_sem._id).eq('user_id', user_id))
    .first())!;

  if (!curr_sem_user) {
    return null;
  }

  const user_prefs = (await ctx.db.get(curr_sem_user.user_prefs_id))!;

  return {
    ...user_data,
    preferred_name: user_prefs.preferred_name,
    sem_user_id: curr_sem_user._id,
    kind: curr_sem_user.kind,
  };
}

export async function getQueueLength(ctx: QueryCtx) {
  const queue = await ctx.db.query('ohq').collect();
  return queue.length;
}

const WAITTIME_LOOKBACK_MINUTES = 60;

export async function getWaittimeData(ctx: QueryCtx) {
  const now = new Date();
  const start_time = new Date(now.getTime() - WAITTIME_LOOKBACK_MINUTES * 60000);

  let total_helped_ms = 0;
  const active_tas = new Set<Id<'tas'>>();

  const curr_sem = await getCurrentSemester(ctx);

  const questions = await ctx.db
    .query('questions')
    .withIndex('by_semester_and_exit_time_ms_and_finished_by', (q) =>
      q.eq('semester_id', curr_sem._id).gte('exit_time_ms', start_time.getTime()),
    )
    .collect();

  for (const question of questions) {
    total_helped_ms += question.help_duration_ms;

    if (!question.ta_id) {
      throw new ConvexError(`Question helped and finished but no helping ta: ${question}`);
    }

    if (!active_tas.has(question.ta_id)) {
      active_tas.add(question.ta_id);
    }
  }

  // handle current questions
  const curr_helping_questions = await ctx.db
    .query('ohq')
    .withIndex('by_status', (q) => q.eq('status', 'being_helped'))
    .collect();

  for (const curr_helping of curr_helping_questions) {
    if (!curr_helping.help_start_time_ms) {
      throw new ConvexError(`Question had being_helped status but no help time: ${curr_helping}`);
    }

    const helping_ms = now.getTime() - curr_helping.help_start_time_ms;
    total_helped_ms += helping_ms;

    if (!curr_helping.helping_ta) {
      throw new ConvexError(`Question helped but no helping ta: ${curr_helping}`);
    }

    if (!active_tas.has(curr_helping.helping_ta.ta_id)) {
      active_tas.add(curr_helping.helping_ta.ta_id);
    }
  }

  // combine
  const total_questions = questions.length + curr_helping_questions.length;
  const num_tas = active_tas.size;

  // do math based on num unhelped students
  const unhelped_questions = await ctx.db
    .query('ohq')
    .filter((x) => x.neq(x.field('status'), 'being_helped'))
    .collect();

  const num_unhelped = unhelped_questions.length;

  // avoid dividing by zero
  if (total_questions !== 0) {
    const mins_per_student = total_helped_ms / 60000 / total_questions;
    const wait_time = (num_unhelped * mins_per_student) / num_tas;

    return {
      mins_per_student: mins_per_student,
      num_unhelped: num_unhelped,
      num_tas: num_tas,
      wait_time: wait_time,
    };
  } else {
    return {
      mins_per_student: 0,
      num_unhelped: 0,
      num_tas: 0,
      wait_time: 0,
    };
  }
}

export async function getQueueEntry(ctx: QueryCtx, student_id: Id<'students'>) {
  const queue_entry = await ctx.db
    .query('ohq')
    .withIndex('by_student', (q) => q.eq('student_id', student_id))
    .first();

  // if (!queue_entry) {
  //   throw new ConvexError("Queue entry not found");
  // }

  return queue_entry;
}

export const createStudentFromUser = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user_data = (await ctx.db.get(args.userId))!;

    // create student prefs
    const new_student_prefs = await ctx.db.insert('userPreferences', {
      user_id: args.userId,
      preferred_name: user_data.name || '',
    });

    const curr_sem = await getCurrentSemester(ctx);

    // create sem user
    const new_sem_user = await ctx.db.insert('semesterUsers', {
      user_id: args.userId,
      user_prefs_id: new_student_prefs,
      semester_id: curr_sem._id,
      kind: 'student',
      notification: {
        title: '',
        body: '',
        timestamp: 0,
      },
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
            'non-frozen student found at the end of the queue with prev_num_frozen > 0',
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
  ctx: QueryCtx,
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
  ctx: QueryCtx,
): Promise<{ user_data: Doc<'users'>; ta: Doc<'tas'> }> {
  const { user_data, ta } = await ensureAuthAndTA(ctx);

  if (!ta.is_admin) {
    throw new ConvexError('User is not an admin');
  }

  return { user_data: user_data, ta: ta };
}

export async function ensureAuthAndOwner(ctx: QueryCtx): Promise<{ user_data: Doc<'users'> }> {
  const user_data = await getCurrentUser(ctx);

  if (!user_data) {
    throw new ConvexError('User not authenticated');
  }

  const curr_sem = await getCurrentSemester(ctx);
  const is_owner = curr_sem.owner_emails.includes(user_data.email!);

  if (!is_owner) {
    throw new ConvexError('User is not an owner');
  }

  return { user_data: user_data };
}

/**
 * Get a student from their sem_user_id
 * @param ctx
 * @param sem_user_id
 * @returns
 */
export async function getStudent(ctx: QueryCtx, sem_user_id: Id<'semesterUsers'>) {
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
  ctx: QueryCtx,
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

export const internalEnsureTA = internalQuery({
  args: {
    user_id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.user_id);

    if (!user) {
      return false;
    }

    const curr_sem = await getCurrentSemester(ctx);

    const sem_user = await ctx.db
      .query('semesterUsers')
      .withIndex('by_sem_and_user', (q) =>
        q.eq('semester_id', curr_sem._id).eq('user_id', user._id),
      )
      .first();

    if (!sem_user) {
      return false;
    }

    const ta = await ctx.db
      .query('tas')
      .withIndex('by_semuser', (q) => q.eq('semester_user_id', sem_user._id))
      .first();

    if (!ta) {
      return false;
    }

    return true;
  },
});

// Make userPreferences entry if it doesn't exist
//
// If a semesterUser doesn't exist - default to student unless they're in future_tas:
//
// If the user is a student
// - add a semesterUser with kind "student"
// - add entry to "students"
//
// If the user is a TA
// - add a semesterUser with kind "ta"
// - add entry to "tas"
export const internalNewSemesterUser = internalMutation({
  args: {
    user_id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user_id = args.user_id;
    const user = await ctx.db.get(user_id);

    if (!user) {
      throw new ConvexError('User not found');
    }

    const email = user.email!;
    const name = user.name!;

    const userPrefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user_id', (x) => x.eq('user_id', user_id))
      .first();

    let user_prefs_id: Id<'userPreferences'>;

    if (!userPrefs) {
      user_prefs_id = await ctx.db.insert('userPreferences', {
        user_id: user_id,
        preferred_name: name || '',
      });
    } else {
      user_prefs_id = userPrefs._id;
    }

    const curr_sem = await getCurrentSemester(ctx);

    const semUser = await ctx.db
      .query('semesterUsers')
      .withIndex('by_sem_and_user', (x) => x.eq('semester_id', curr_sem._id).eq('user_id', user_id))
      .first();

    if (!semUser) {
      // check if they're in future_tas
      const future_ta = await ctx.db
        .query('future_tas')
        .withIndex('by_sem_and_email', (x) => x.eq('semester_id', curr_sem._id).eq('email', email))
        .first();

      if (future_ta) {
        // They're a TA
        const sem_user_id = await ctx.db.insert('semesterUsers', {
          kind: 'TA',
          semester_id: curr_sem._id,
          user_id: user_id,
          user_prefs_id: user_prefs_id,
          notification: {
            title: '',
            body: '',
            timestamp: 0,
          },
        });

        await ctx.db.insert('tas', {
          user_id: user_id,
          user_prefs_id: user_prefs_id,
          semester_user_id: sem_user_id,

          is_admin: future_ta.is_admin,

          zoom_enabled: false,
          zoom_url: '',

          join_notifs_enabled: false,
          remind_notifs_enabled: false,
          remind_time_mins: 10,

          show_self_timer: false,
          show_others_timer: false,

          num_helped: 0,
          time_helped_ms: 0,
        });

        await ctx.db.delete(future_ta._id);
      } else {
        // They're a student

        const sem_user_id = await ctx.db.insert('semesterUsers', {
          kind: 'student',
          semester_id: curr_sem._id,
          user_id: user_id,
          user_prefs_id: user_prefs_id,
          notification: {
            title: '',
            body: '',
            timestamp: 0,
          },
        });

        await ctx.db.insert('students', {
          user_id: user_id,
          user_prefs_id: user_prefs_id,
          semester_user_id: sem_user_id,

          num_questions: 0,
          time_on_queue_ms: 0,
          num_asked_to_fix: 0,
        });
      }
    }
  },
});

export const internalSendNotification = internalMutation({
  args: {
    semester_user: v.id('semesterUsers'),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.semester_user, {
      notification: {
        title: args.title,
        body: args.body,
        timestamp: new Date().getTime(),
      },
    });
  },
});
