import React from "react";

import Announcements from "./Annoucements";
import QueueStats from "./QueueStats";
// import UninitializedDialog from "./dialogs/UninitializedDialog";

function SharedMain() {
  // const { queueData } = useContext(QueueDataContext);
  return (
    <div>
      {
        // TODO CONVEX HANDLE UNINITIALIZED SEM
        // queueData?.uninitializedSem ?
        // <UninitializedDialog /> :
        // (
        <div>
          <Announcements />
          <QueueStats />
        </div>
        // )
      }
    </div>
  );
}

export default SharedMain;
