import React, { useState } from 'react';
import Announcements from '../Annoucements';
import QueueStats from './QueueStats'

function SharedMain (props) {
    const { theme, queueData } = props;

    return (
      <div>
          <QueueStats 
            theme={theme}
            queueData={queueData}
          />
          <Announcements theme={theme}/>
      </div>
    );
}
  
export default SharedMain;
