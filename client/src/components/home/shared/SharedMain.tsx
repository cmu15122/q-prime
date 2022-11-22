import React from 'react';

import Announcements from './Annoucements';
import QueueStats from './QueueStats';
import UninitializedDialog from './dialogs/UninitializedDialog';
import {useQueueDataContext} from '../../../App';

function SharedMain() {
  const {queueData} = useQueueDataContext();

  return (
    <div>
      {
        queueData?.uninitializedSem ?
        <UninitializedDialog /> :
        (
          <div>
            <Announcements/>
            <QueueStats/>
          </div>
        )
      }
    </div>
  );
}

export default SharedMain;
