import React, {useContext, useState} from 'react';

import Announcements from './Annoucements';
import QueueStats from './QueueStats';
import UninitializedDialog from './dialogs/UninitializedDialog';
import {useQueueDataContext} from '../../../App';

function SharedMain(props) {
  const {queueFrozen, setQueueFrozen} = props;
  const [allRead, setAllRead] = useState(true);

  const {queueData} = useQueueDataContext();

  return (
    <div>
      {
        queueData?.uninitializedSem ?
        <UninitializedDialog /> :
        (
          <div>
            <Announcements setAllRead={setAllRead} />
            <QueueStats
              queueFrozen={queueFrozen}
              setQueueFrozen={setQueueFrozen}
              allRead={allRead}
            />
          </div>
        )
      }
    </div>
  );
}

export default SharedMain;
