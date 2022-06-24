let crypto = require('crypto');

let sio;

let ta_room = crypto.randomBytes(72).toString('base64');
let student_room = crypto.randomBytes(72).toString('base64');

exports.init = function(server) {
    sio = require("socket.io")(server, {
        cors: {
            origin: "http://localhost:3000", // TODO: change to client URL
            methods: ["GET", "POST"]
        }
    });

    sio.on("connection", (socket) => {
        // TODO: join student or TA room based on OAuth
        console.log("New client connected");

        socket.on("disconnect", () => {
          console.log("Client disconnected");
        });
    });

    // We can have sockets ping things on an interval (like wait times), i.e.
    // exports.update();
    // setInterval(() => exports.update(), 5000);
};

exports.update = function() {
    // Emitting a new message. Will be consumed by the client
    const response = new Date();
    sio.emit("update", response);

    // We can emit things to certain rooms only, i.e.
    // sio.to(student_room).emit("update", response);
};
