import io from "socket.io-client";

let socket;
const SOCKET_URL = "http://localhost:8000";

export const initiateSocket = () => {
  socket = io(SOCKET_URL);
  console.log("Connecting to socket");
};

export const socketSubscribeTo = (emission, callback) => {
  if (!socket) {
    return;
  }
 
  socket.on(emission, (data) => {
    callback(data);
  });
};
