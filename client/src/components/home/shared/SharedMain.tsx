import React, {useContext} from 'react';

import Announcements from './Annoucements';
import QueueStats from './QueueStats';
import UninitializedDialog from './dialogs/UninitializedDialog';
import {QueueDataContext} from '../../../App';

function SharedMain() {
  const {queueData} = useContext(QueueDataContext);

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
