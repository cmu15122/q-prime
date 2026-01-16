import React, { useMemo, useState } from "react";

import YourEntry from "./YourEntry";
import RemoveQOverlay from "./RemoveQConfirm";
import TAHelpingOverlay from "./TAHelpingOverlay";
import UpdateQuestionOverlay from "./UpdateQuestionOverlay";
import MessageOverlay from "./MessageOverlay";
import AskQuestion from "../shared/AskQuestion";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

function StudentMain() {
  const [removeConfirm, setRemoveConfirm] = useState(false);

  const queueData = useQuery(api.home.home_get.getQueueData);
  const userData = useQuery(api.home.home_get.getUserData);
  const studentData = userData?.student_data;

  const removeStudentMutation = useMutation(api.home.home_mutate.removeStudent);
  const removeFromQueue = async () => {
    await removeStudentMutation({
      reason: "removed",
      student_id: userData!.student_data!.student_id,
    }).finally(() => {
      setRemoveConfirm(false);
    });
  };

  const dismissMessageMutation = useMutation(
    api.home.home_mutate.dismissMessage,
  );
  const dismissMessage = async () => {
    await dismissMessageMutation();
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

      <MessageOverlay
        open={studentData?.has_unread_messages ?? false}
        removeFromQueue={removeFromQueue}
        dismissMessage={dismissMessage}
        handleClose={() => {}}
      />
    </div>
  );
}

export default StudentMain;
