import React, { useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';

import config from '../../config/config.json';

function GoogleLogin(props) {
    const { queueData } = props
    const [, setCookie] = useCookies(['user']);
    const divRef = useRef(null);

    useEffect(() => {
        if (!window.google || !divRef.current) {
            return;
        }

        window.google.accounts.id.initialize({
            client_id: config.google_client_id,
            callback: async (response) => {
                const res = await fetch('/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        token: response.credential,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const body = await res.json();
                if (res.status === 200) {
                    setCookie('user', JSON.stringify(body));
                    window.location.reload();
                }
            }
        });

        window.google.accounts.id.renderButton(
            divRef.current,
            { theme: "outline", size: "large" }
        ); 
    }, [queueData, setCookie]);

    return (
        <div ref={divRef} id="signInDiv"></div>
    )
}
  
export default GoogleLogin;
