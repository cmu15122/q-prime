let crypto = require('crypto');
let models = require('../models');
let settings = require('./settings');

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
        console.log("New client connected");
        socket.join(student_room); // By default, join the student room

        socket.on("authenticate", function (auth) {
            if (!auth) return;

            models.account.findOne({
                where: { access_token: auth }, 
                include: [
                    { 
                        model: models.semester_user,  
                        where: { sem_id: settings.get_admin_settings().currSem }, 
                        as: "semester_users"
                    }
                ]
            }).then(function (result) {
                if (!result) return;

                socket.session = result;
                if (result.semester_users[0].isTA) {
                    socket.leave(student_room);
                    socket.join(ta_room);
                }
            });

        });

        socket.on("disconnect", () => {
          console.log(`Client disconnected (${socket.session?.fname} ${socket.session?.lname})`);
          socket.leave(student_room);
          socket.leave(ta_room);
        });
    });
};

exports.queueFrozen = function(isFrozen) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("queueFrozen", {
        isFrozen: isFrozen
    });
}

exports.waittimes = function(times) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("waittimes", {
        times: times
    });
}

exports.addAnnouncement = function(announcement) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }
    sio.emit("addAnnouncement", {
        announcement: announcement
    });
}

exports.updateAnnouncement = function(id, announcement) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }
    sio.emit("updateAnnouncement", {
        updatedId: id,
        announcement: announcement
    });
}

exports.deleteAnnouncement = function(announcementId) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }
    sio.emit("deleteAnnouncement", {
        deletedId: announcementId
    });
}

// Example function, delete when done
exports.update = function() {
    // Emitting a new message. Will be consumed by the client
    const response = new Date();
    sio.emit("update", response);

    // We can emit things to certain rooms only, i.e.
    // sio.to(student_room).emit("update", response);
};
