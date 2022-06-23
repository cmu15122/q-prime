import React, { useState } from 'react';
import Announcements from './Annoucements';
import QueueStats from './QueueStats'

function SharedMain (props) {
    const { theme, queueData, queueFrozen, setQueueFrozen } = props;

    return (
      <div>
          <Announcements theme={theme} queueData={queueData} />
          <QueueStats 
            theme={theme}
            queueData={queueData}
            queueFrozen={queueFrozen}
            setQueueFrozen={setQueueFrozen}
          />
      </div>
    );
}
  
export default SharedMain;
