import React, { useEffect, useMemo, useState } from "react";

import YourEntry from "./YourEntry";
import RemoveQOverlay from "./RemoveQConfirm";
import TAHelpingOverlay from "./TAHelpingOverlay";
import UpdateQuestionOverlay from "./UpdateQuestionOverlay";
import MessageRespond from "./MessageOverlay";
import AskQuestion from "../shared/AskQuestion";

import { socketSubscribeTo } from "../../../services/SocketsService";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

function StudentMain() {
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [messagingTAName, setMessagingTAName] = useState("");

  const queueData = useQuery(api.home.home_get.getQueueData);
  const userData = useQuery(api.home.home_get.getUserData);
  const studentData = userData?.student_data;

  // TODO CONVEX SOCKETS
  // useEffect(() => {
  //   socketSubscribeTo("help", (res) => {
  //     if (res.andrewID === userData.andrewID) {
  //       new Notification("It's your turn to get help!", {
  //         body: `${res.data.taData.taName} is ready to help you.`,
  //         requireInteraction: true,
  //       });
  //     } else {
  //       console.log("Received help for other student");
  //     }
  //   });

  //   socketSubscribeTo("updateQRequest", (res) => {
  //     if (res.andrewID === userData.andrewID) {
  //       new Notification("Please update your question", {
  //         requireInteraction: true,
  //       });
  //     } else {
  //       console.log("Received updateQRequest for other student");
  //     }
  //   });

  //   socketSubscribeTo("message", (res) => {
  //     if (res.andrewID === userData.andrewID) {
  //       setMessagingTAName(res.data.taName);

  //       new Notification("You've been messaged by a TA", {
  //         requireInteraction: true,
  //       });
  //     } else {
  //       console.log("Received message for other student");
  //     }
  //   });

  //   socketSubscribeTo("remove", (res) => {
  //     if (res.andrewID === userData.andrewID) {
  //       new Notification("You've been removed from the queue", {
  //         requireInteraction: true,
  //       });
  //     } else {
  //       console.log("Received remove for other student");
  //     }
  //   });

  //   socketSubscribeTo("approveCooldown", (res) => {
  //     if (res.andrewID === userData.andrewID) {
  //       new Notification("Your entry been approved by a TA", {
  //         requireInteraction: true,
  //       });
  //     } else {
  //       console.log("Received approveCooldown for other student");
  //     }
  //   });
  // }, [userData.andrewID]);

  const removeFromQueue = async () => {
    await useMutation(api.home.home_mutate.removeStudent)({
      reason: "removed",
      student_id: userData!.student_data!.student_id,
    }).finally(() => {
      setRemoveConfirm(false);
    });
  };

  // CONVEX TODO USE HAS_UNREAD_MESSAGES FIELD (I think I deleted frontend that handeld this lol so have to bring it back)
  const dismissMessage = async () => {
    await useMutation(api.home.home_mutate.dismissMessage)();
  };

  const statusDependentComponents = useMemo(() => {
    return (
      <div>
        {studentData ? (
          <div>
            <YourEntry openRemoveOverlay={() => setRemoveConfirm(true)} />
            <RemoveQOverlay
              open={removeConfirm}
              removeFromQueue={() => removeFromQueue()}
              handleClose={() => setRemoveConfirm(false)}
            />
          </div>
        ) : queueData?.is_frozen ? null : (
          <AskQuestion />
        )}
      </div>
    );
  }, [studentData, queueData, removeConfirm]);

  return (
    <div>
      {statusDependentComponents}

      <TAHelpingOverlay open={studentData?.status === "being_helped"} />

      <UpdateQuestionOverlay
        open={studentData?.status === "fixing_question"}
        handleClose={() => {}}
      />

      <MessageRespond
        open={studentData?.has_unread_messages ?? false}
        messagingTAName={messagingTAName}
        removeFromQueue={removeFromQueue}
        dismissMessage={dismissMessage}
        handleClose={() => {}}
      />
    </div>
  );
}

export default StudentMain;
