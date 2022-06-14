import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
    Box, Button, Dialog, DialogContent, FormControlLabel, Checkbox, Typography, TextField, Grid
} from '@mui/material'

import config from '../../config/config.json';

function LoginMain() {
    const [user, setUser] = useState(null);
    const [cookies, setCookie] = useCookies(['user']);

    useEffect(() => {
        window.onload = setupGoogle;
    });

    const setupGoogle = () => {
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

        console.log(document.getElementById("signInDiv"));
        window.google.accounts.id.renderButton(
            document.getElementById("signInDiv"),
            { theme: "outline", size: "large" }
        ); 
    };

    return (
        <div id="signInDiv"></div>
    )
}
  
export default LoginMain;
