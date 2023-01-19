let crypto = require('crypto');
let models = require('../models');
let settings = require('./settings');

let config = require('../config/config');

let sio;

let ta_room = crypto.randomBytes(72).toString('base64');
let student_room = crypto.randomBytes(72).toString('base64');

exports.init = function (server) {
    sio = require("socket.io")(server, {
        cors: {
            origin: config.PROTOCOL + "://" + config.DOMAIN + ":" + config.CLIENT_PORT,
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
                if (result.semester_users[0].is_ta) {
                    socket.leave(student_room);
                    socket.join(ta_room);
                }
            });
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected (${socket.session?.name})`);
            socket.leave(student_room);
            socket.leave(ta_room);
        });
    });
};

exports.queueData = function (queueData) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("queueData", {
        ...queueData
    });
}

exports.studentData = function (studentData) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("studentData", {
        ...studentData
    });
}

exports.allStudents = function (allStudents) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("allStudents", {
        allStudents: allStudents
    });
}

exports.help = function (studentAndrewID, taAccount, name) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("help", {
        andrewID: studentAndrewID,
        data: {
            taData: {
                taId: taAccount.ta.ta_id,
                taName: name,
                taZoomUrl: taAccount.ta.zoom_url
            }
        }
    });
}

exports.unhelp = function (studentAndrewID, taAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("unhelp", {
        andrewID: studentAndrewID,
        data: {
            taData: {
                taAndrewID: taAndrewID
            }
        }
    });
}

exports.add = function (studentData) {
    sio.emit("add", {
        studentData: studentData
    });
}

exports.remove = function (studentAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("remove", {
        andrewID: studentAndrewID,
    });
}

exports.updateQRequest = function (studentAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("updateQRequest", {
        andrewID: studentAndrewID,
    });
}

exports.message = function (studentAndrewID, name) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("message", {
        andrewID: studentAndrewID,
        data: {
            taData: {
                taName: name
            }
        }
    });
}

exports.dismiss_message = function (studentAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(ta_room).emit("dismissMessage", {
        andrewID: studentAndrewID,
    });
}

exports.approveCooldown = function (studentAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("approveCooldown", {
        andrewID: studentAndrewID,
    });
}
