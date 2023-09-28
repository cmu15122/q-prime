import io from 'socket.io-client';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

let socket = null;
const subscriptions = [];

const SOCKET_URL = process.env.REACT_APP_PROTOCOL + '://' + process.env.REACT_APP_DOMAIN;
const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH;

export const initiateSocket = () => {
  if (socket) {
    return;
  }

  socket = io(SOCKET_URL, {path: SOCKET_PATH});

  const userCookies = cookies.get('user');
  if (userCookies != null) {
    socket.emit('authenticate', userCookies.access_token);
  }
};

export const socketSubscribeTo = (emission, callback) => {
  if (!socket) {
    initiateSocket();
  }

  // Add the event and callback to our list of subscriptions
  subscriptions.push({emission, callback});

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

// Function to resubscribe to all events
const resubscribeAll = () => {
  subscriptions.forEach(({emission, callback}) => {
    socketSubscribeTo(emission, callback);
  });
};

// Visibility change listener
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // The page is visible again
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      // If the socket is not open, reconnect and resubscribe to all events
      socket = null;
      initiateSocket();
      resubscribeAll();
    }
  }
});
