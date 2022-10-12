import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {useCookies} from 'react-cookie';

import HomeService from '../../services/HomeService';

export default function GoogleLogin() {
  const [, setCookie] = useCookies(['user']);
  const divRef = useRef(null);

  useEffect(() => {
    if (!(window as any).google || !divRef.current) {
      return;
    }

    (window as any).google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: (response) => {
        HomeService.login(JSON.stringify({
          token: response.credential,
        })).then((res) => {
          setCookie('user', JSON.stringify(res.data));
          window.location.reload();
        });
      },
    });

    (window as any).google.accounts.id.renderButton(
        divRef.current,
        {theme: 'outline', size: 'large'},
    );
  }, [setCookie]);

  return (
    <div ref={divRef} id="signInDiv"></div>
  );
}

GoogleLogin.propTypes = {
  queueData: PropTypes.any,
};
