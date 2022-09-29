import io from "socket.io-client";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

let socket;
const SOCKET_URL = process.env.REACT_APP_PROTOCOL + "://" + process.env.REACT_APP_DOMAIN;
const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH;

export const initiateSocket = () => {
    if (socket) {
        return;
    }

    socket = io(SOCKET_URL, { path: SOCKET_PATH });
  
    const userCookies = cookies.get('user');
    if (userCookies != null) {
        socket.emit("authenticate", userCookies.access_token);
    }
};

export const socketSubscribeTo = (emission, callback) => {
    if (!socket) {
        initiateSocket();
    }

    socket.on(emission, (data) => {
        callback(data);
    });
};

export const socketUnsubscribeFrom = (emission) => {
    if (!socket) {
        return;
    }

    socket.off(emission);
};
