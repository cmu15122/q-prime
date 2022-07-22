import React, { useState } from 'react';
import Announcements from './Annoucements';
import QueueStats from './QueueStats'

function SharedMain (props) {
    const { theme, queueData, queueFrozen, setQueueFrozen } = props;
    const [allRead, setAllRead] = useState(true);

    return (
      <div>
          <Announcements theme={theme} queueData={queueData} setAllRead={setAllRead} />
          <QueueStats 
            theme={theme}
            queueData={queueData}
            queueFrozen={queueFrozen}
            setQueueFrozen={setQueueFrozen}
            allRead={allRead}
          />
      </div>
    );
}
  
export default SharedMain;
