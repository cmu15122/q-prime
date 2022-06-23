import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';

import config from '../../config/config.json';

function GoogleLogin(props) {
    const { queueData } = props
    const [setCookie] = useCookies(['user']);

    useEffect(() => {
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
                setCookie('user', JSON.stringify(body));
                window.location.reload();
            }
        });

        window.google.accounts.id.renderButton(
            document.getElementById("signInDiv"),
            { theme: "outline", size: "large" }
        ); 
    }, [queueData, setCookie]);

    return (
        <div id="signInDiv"></div>
    )
}
  
export default GoogleLogin;
