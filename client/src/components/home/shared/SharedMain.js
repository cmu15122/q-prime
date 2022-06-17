import React, { useState } from 'react';
import Announcements from '../Annoucements';
import QueueStats from './QueueStats'

function SharedMain (props) {
    const { theme, queueData } = props;

    return (
      <div>
          <Announcements theme={theme}/>
          <QueueStats 
            theme={theme}
            queueData={queueData}
          />
      </div>
    );
}
  
export default SharedMain;
