import { useQuery } from 'convex/react';
import { FunctionReference } from 'convex/server';
import React, { useEffect, useState } from 'react';

export default function ConvexNotifHandler(props: {
  convexNotifQuery: FunctionReference<"query", "public", {}, {value: boolean, messageTitle: string ,messageBody: string}>
}) {
  const convexNotifQuery = props.convexNotifQuery;
  const queryRes = useQuery(convexNotifQuery);
  const [queryVal, setQueryVal] = useState<boolean | null>(null);

  useEffect(() => {
    if (queryRes) {
      if (queryVal !== null) {
        // if the value changes from false to true, that's a notif
        if (queryRes.value && queryVal !== queryRes.value) {
          new Notification(queryRes.messageTitle, {
            body: queryRes.messageBody,
            requireInteraction: true,
          });
        }
      }

      setQueryVal(queryRes.value);
    }
  }, [queryRes])

  return <></>
}
