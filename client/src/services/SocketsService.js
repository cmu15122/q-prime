import io from "socket.io-client";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

let socket;
const SOCKET_URL = "http://localhost:8000";

export const initiateSocket = () => {
    if (socket) {
        return;
    }

    socket = io(SOCKET_URL);
    console.log("Connecting to socket");
  
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
