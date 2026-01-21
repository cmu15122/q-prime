import { useQuery } from 'convex/react';
import React, { useEffect, useState } from 'react';
import { api } from '../../../convex/_generated/api';

export default function ConvexNotifHandler() {
  const notif = useQuery(api.home.home_get.getNotif);
  const [oldNotifTimestamp, setOldNotifTimestamp] = useState<number | null>(null);

  useEffect(() => {
    if (notif) {
      if (oldNotifTimestamp !== null) {
        // if the value changes from false to true, that's a notif
        if (notif.timestamp !== oldNotifTimestamp) {
          new Notification(notif.title, {
            body: notif.body,
            requireInteraction: true,
          });
        }

      }
      setOldNotifTimestamp(notif.timestamp);
    }
  }, [notif])

  return <></>
}
