import io, { Socket } from 'socket.io-client';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

let socket: Socket;
const SOCKET_URL =
  process.env.REACT_APP_PROTOCOL + '://' + process.env.REACT_APP_DOMAIN;
const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH;

export const initiateSocket = () => {
  if (socket) {
    return;
  }

  socket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    transports: ['polling', 'websocket'],
    closeOnBeforeunload: true,
    forceNew: true,
    tryAllTransports: true,
    withCredentials: true,
  });

  const userCookies = cookies.get('user');
  if (userCookies != null) {
    socket.emit('authenticate', userCookies.access_token);
  }

  socket.on('connect', () => {
    const transport = socket.io.engine.transport.name; // in most cases, "polling"

    console.log('Connected with transport:', transport);

    socket.io.engine.on('upgrade', () => {
      const upgradedTransport = socket.io.engine.transport.name; // in most cases, "websocket"
      console.log(
          'Transport upgraded from',
          transport,
          'to',
          upgradedTransport,
      );
    });
  });

  socket.on('disconnect', (reason, details) => {
    console.log('Client disconnected, reconnecting', reason, details);
    ensureSocketConnected();
  });

  socket.on('connect_error', (error) => {
    console.log('Connection error, reconnecting', error.message);
    ensureSocketConnected();
  });
};

// use subscriptions when reconnecting to listen for all previous events
const subscriptions = {};

export const socketSubscribeTo = (emission, callback) => {
  if (!socket) {
    initiateSocket();
  }

  socket.on(emission, (data) => {
    callback(data);
  });

  subscriptions[emission] = callback;
};

export const socketUnsubscribeFrom = (emission) => {
  if (!socket) {
    return;
  }

  socket.off(emission);

  delete subscriptions[emission];
};

export const ensureSocketConnected = () => {
  if (!socket) {
    console.log('No existing socket, initiating');
    initiateSocket();
  }

  if (!socket.connected || !socket.active) {
    console.log('Existing socket not connected or inactive, reconnecting');
    socket.close();
    socket.removeAllListeners();
    socket.connect();

    // re-subscribe to all previous events (don't call socketSubscribeTo to avoid infinite loop)
    Object.keys(subscriptions).forEach((emission) => {
      socket.on(emission, subscriptions[emission]);
    });
  }
};
