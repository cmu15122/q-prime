import {
    Button,
} from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import { useCookies } from 'react-cookie';

import HomeService from '../../services/HomeService';

function GoogleLogin() {
    const [_, setCookie] = useCookies(['user']);

    const login = useGoogleLogin({
        onSuccess: codeResponse => {
            HomeService.login(JSON.stringify({
                codeResponse: codeResponse
            })).then((res) => {
                setCookie('user', JSON.stringify(res.data));
                window.location.reload();
            });
        },
        flow: 'auth-code',
    });

    return (
        <Button color="secondary" variant="contained" sx={{ mx: 2 }} onClick={() => login()}>Log In</Button>
    )
}
  
export default GoogleLogin;
