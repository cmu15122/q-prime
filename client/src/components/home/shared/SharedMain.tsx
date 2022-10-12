import React, { useState } from 'react';

import Announcements from './Annoucements';
import QueueStats from './QueueStats'
import UninitializedDialog from './dialogs/UninitializedDialog';

function SharedMain (props) {
    const { queueData, queueFrozen, setQueueFrozen } = props;
    const [allRead, setAllRead] = useState(true);

    return (
        <div>
            { 
                queueData?.uninitializedSem ? 
                <UninitializedDialog queueData={queueData} /> :
                (
                    <div>
                        <Announcements queueData={queueData} setAllRead={setAllRead} />
                        <QueueStats 
                            queueData={queueData}
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
