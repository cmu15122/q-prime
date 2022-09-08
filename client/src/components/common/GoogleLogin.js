import React, { useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';

import config from '../../config/config.json';
import HomeService from '../../services/HomeService';

function GoogleLogin() {
    const [, setCookie] = useCookies(['user']);
    const divRef = useRef(null);

    useEffect(() => {
        if (!window.google || !divRef.current) {
            return;
        }

        window.google.accounts.id.initialize({
            client_id: config.google_client_id,
            callback: (response) => {
                HomeService.login(JSON.stringify({
                    token: response.credential,
                })).then((res) => {
                    setCookie('user', JSON.stringify(res.data));
                    window.location.reload();
                });
            }
        });

        window.google.accounts.id.renderButton(
            divRef.current,
            { theme: "outline", size: "large" }
        ); 
    }, [setCookie]);

    return (
        <div ref={divRef} id="signInDiv"></div>
    )
}
  
export default GoogleLogin;
