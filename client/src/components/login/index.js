import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import config from '../../config/config.json';

function Login() {
    const [user, setUser] = useState('user');
    const [cookies, setCookie, removeCookie] = useCookies(['user']);

    useEffect(() => {
        setUser(cookies.user); // TODO: we would actually grab user information from the server here

        window.onload = function() {
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
        }
    }, [cookies, setCookie]);

    function handleLogout() {
        fetch('/logout', {
            method: 'POST',
            body: JSON.stringify({
                // TODO: pass in whatever we use to store current user info
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        removeCookie('user');
        window.location.reload();
    }

    return (
        user ? (
            <div>
                <h3>You are logged in as {user.name} ({user.email})</h3>
                <button onClick={handleLogout}>Logout</button>
            </div>
        ) : (
            <div id="signInDiv"></div>
        )
    )
}
  
export default Login;
