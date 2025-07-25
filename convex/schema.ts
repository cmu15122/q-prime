import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

export default defineSchema({
  ...authTables,
  // defines cross-semester TA and student preferences (doesn't exist on user because I'm scared to touch the auth tables)
  userPreferences: defineTable({
    user_id: v.id('users'),
    preferred_name: v.optional(v.string()),
  }).index('by_user_id', ['user_id']),

  // we'll enforce in the code that this table only ever has one row
  globalSettings: defineTable({
    curr_sem: v.id('semesters'),
    course_name: v.string(),
    slackbot_webhook_url: v.optional(v.string()),
    questions_policy_url: v.optional(v.string()),
    rejoin_time_ms: v.number(),
    allowed_email_domains: v.array(v.string()),
    allow_cooldown_override: v.boolean(),
    day_to_location_dict: v.record(v.string(), v.array(v.string())),
    allow_tas_show_others_timer: v.boolean(),

    // waittime configs
    waittime_ping_threshold_mins: v.number(),
    waittime_ping_interval_mins: v.number(),
    waittime_questions_lookback_time_mins: v.number(),

    // current queue status
    is_frozen: v.boolean(),
    announcements: v.array(v.string()),
  }),

  semesters: defineTable({
    name: v.string(),
    owners: v.array(v.id('users')),

    enable_whitelist: v.boolean(),
    enable_blacklist: v.boolean(),
    whitelist: v.array(v.string()),
    blacklist: v.array(v.string()),
  }),

  assignments: defineTable({
    name: v.string(),
    assignment_type: v.optional(v.string()),
    start_date_ms: v.number(),
    end_date_ms: v.number(),
  }),

  semesterUsers: defineTable({
    user_id: v.id('users'),
    user_prefs_id: v.id('userPreferences'),
    semester_id: v.id('semesters'),
    kind: v.union(v.literal('TA'), v.literal('student')),
  }).index('by_sem_and_user', ['semester_id', 'user_id']),

  students: defineTable({
    user_id: v.id('users'),
    user_prefs_id: v.id('userPreferences'),
    semester_user_id: v.id('semesterUsers'),

    num_questions: v.number(),
    time_on_queue_ms: v.number(),
    num_asked_to_fix: v.number(),
  }).index('by_semuser', ['semester_user_id']),

  tas: defineTable({
    user_id: v.id('users'),
    user_prefs_id: v.id('userPreferences'),
    semester_user_id: v.id('semesterUsers'),

    is_admin: v.boolean(),

    zoom_enabled: v.boolean(),
    zoom_url: v.optional(v.string()),

    join_notifs_enabled: v.boolean(),
    remind_notifs_enabled: v.boolean(),
    remind_time_mins: v.number(),

    show_self_timer: v.boolean(),
    show_others_timer: v.boolean(),

    num_helped: v.number(),
    time_helped_ms: v.number(),
  }).index('by_semuser', ['semester_user_id']),

  questions: defineTable({
    semester_id: v.id('semesters'),
    assignment_id: v.id('assignments'),
    student_id: v.id('users'),
    ta_id: v.id('tas'),

    question: v.string(),
    location: v.string(),

    entry_time_ms: v.number(),
    exit_time_ms: v.number(),
    help_time_ms: v.number(),

    num_asked_to_fix: v.number(),
  }),

  // use a table as the actual queue lol
  // each row in the table is a student on the queue
  ohq: defineTable({
    student_id: v.id('students'),
    assignment_id: v.id('assignments'),
    statuses: v.array(
      v.union(
        v.literal('being_helped'),
        v.literal('waiting'),
        v.literal('fixing_question'),
        v.literal('frozen'),
        v.literal('cooldown_violation'),
        v.literal('received_message'),
        v.literal('error')
      )
    ),
    question: v.string(),
    location: v.string(),
    entry_time_ms: v.number(),

    ta_id: v.optional(v.id('tas')),
    help_time_ms: v.optional(v.number()),

    messages_from_tas: v.array(
      v.object({
        from_ta_id: v.id('tas'),
        message: v.string(),
        sent_time_ms: v.number(),
      })
    ),
  }).index('by_student', ['student_id']),
});
