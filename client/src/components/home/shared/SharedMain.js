import React, { useState } from 'react';

import Announcements from './Annoucements';
import QueueStats from './QueueStats'
import UninitializedDialog from './dialogs/UninitializedDialog';

function SharedMain (props) {
    const { theme, queueData, queueFrozen, setQueueFrozen } = props;
    const [allRead, setAllRead] = useState(true);

    return (
        <div>
            { 
                queueData?.uninitializedSem ? 
                <UninitializedDialog theme={theme} queueData={queueData} /> :
                (
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
                )
            }
        </div>
    );
}
  
export default SharedMain;
