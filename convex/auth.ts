import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { Id, Doc } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { getCurrentSemester } from "./common";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx: MutationCtx, args) {
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
      const user_id = args.userId;
      const user = (await ctx.db.get(user_id)) as Doc<"users">;
      const email = user.email;

      if (!email) {
        throw new Error("User email is undefined");
      }

      const userPrefs = await ctx.db
        .query("userPreferences")
        .withIndex("by_user_id", (x) => x.eq("user_id", user_id))
        .first();

      let user_prefs_id: Id<"userPreferences">;

      if (!userPrefs) {
        user_prefs_id = await ctx.db.insert("userPreferences", {
          user_id: user_id,
          preferred_name: user.name || "",
        });
      } else {
        user_prefs_id = userPrefs._id;
      }

      const curr_sem = await getCurrentSemester(ctx);
      const semUser = await ctx.db
        .query("semesterUsers")
        .withIndex("by_sem_and_user", (x) =>
          x.eq("semester_id", curr_sem._id).eq("user_id", user_id),
        )
        .first();

      if (!semUser) {
        // check if they're in future_tas
        const future_ta = await ctx.db
          .query("future_tas")
          .withIndex("by_sem_and_email", (x) =>
            x.eq("semester_id", curr_sem._id).eq("email", email),
          )
          .first();

        if (future_ta) {
          // They're a TA
          const sem_user_id = await ctx.db.insert("semesterUsers", {
            kind: "TA",
            semester_id: curr_sem._id,
            user_id: user_id,
            user_prefs_id: user_prefs_id,
          });

          await ctx.db.insert("tas", {
            user_id: user_id,
            user_prefs_id: user_prefs_id,
            semester_user_id: sem_user_id,

            is_admin: future_ta.is_admin,

            zoom_enabled: false,
            zoom_url: "",

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

          const sem_user_id = await ctx.db.insert("semesterUsers", {
            kind: "student",
            semester_id: curr_sem._id,
            user_id: user_id,
            user_prefs_id: user_prefs_id,
          });

          await ctx.db.insert("students", {
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
  },
});
