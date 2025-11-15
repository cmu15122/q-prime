import React, { useEffect } from "react";
import { socketSubscribeTo } from "../../../services/SocketsService";
import AskQuestion from "../shared/AskQuestion";
import StudentEntries from "./StudentEntries";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function TAMain() {
  const userData = useQuery(api.home.home_get.getUserData);

  useEffect(() => {
    if (!userData) {
      return;
    }

    // TODO CONVEX MAKE SOCKETS WORK
    // socketSubscribeTo(`remind/${userData.user_id}`, (res) => {
    //   new Notification("Time Alert!", {
    //     body: `You've been helping for ${userData.ta_data!.remind_time_mins} minutes!`,
    //     requireInteraction: false,
    //   });
    // });

    // socketSubscribeTo(`doneHelping/${userData.user_id}`, (data) => {
    //   new Notification("Done Helping!", {
    //     body: `You helped ${data.studentAndrewId} for ${data.helpTime} minutes!`,
    //     requireInteraction: false,
    //   });
    // });
  }, [userData]);

  return (
    <div>
      <StudentEntries />
      <AskQuestion />
    </div>
  );
}
