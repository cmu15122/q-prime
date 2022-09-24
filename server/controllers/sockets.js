let crypto = require('crypto');
let models = require('../models');
let settings = require('./settings');

let sio;

let ta_room = crypto.randomBytes(72).toString('base64');
let student_room = crypto.randomBytes(72).toString('base64');

exports.init = function (server) {
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

exports.queueFrozen = function (isFrozen) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("queueFrozen", {
        isFrozen: isFrozen
    });
}

exports.waittimes = function (minsPerStudent, numStudents, numUnhelped) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("waittimes", {
        minsPerStudent: minsPerStudent,
        numStudents: numStudents,
        numUnhelped: numUnhelped
    });
}

exports.addAnnouncement = function (announcement) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }
    sio.emit("addAnnouncement", {
        announcement: announcement
    });
}

exports.updateAnnouncement = function (id, announcement) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }
    sio.emit("updateAnnouncement", {
        updatedId: id,
        announcement: announcement
    });
}

exports.deleteAnnouncement = function (announcementId) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }
    sio.emit("deleteAnnouncement", {
        deletedId: announcementId
    });
}

exports.help = function (studentData, taAccount) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("help", {
        andrewID: studentData.andrewID,
        data: {
            studentData: studentData,
            taData: {
                taId: taAccount.ta.ta_id,
                taName: taAccount.name,
                taZoomUrl: taAccount.ta.zoom_url
            }
        }
    });
}

exports.unhelp = function (studentData, taAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("unhelp", {
        andrewID: studentData.andrewID,
        data: {
            studentData: studentData,
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

exports.remove = function (studentAndrewID, studentData) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("remove", {
        andrewID: studentAndrewID,
        studentData: studentData
    });
}

exports.updateQuestion = function (studentData) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(ta_room).emit("updateQuestion", {
        andrewID: studentData.andrewID,
        data: {
            studentData: studentData
        }
    });
}

exports.updateQRequest = function (studentData) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("updateQRequest", {
        andrewID: studentData.andrewID,
        data: {
            studentData: studentData
        }
    });
}

exports.message = function (studentData, taAccount) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("message", {
        andrewID: studentData.andrewID,
        data: {
            studentData: studentData,
            taData: {
                taName: taAccount.name
            }
        }
    });
}

exports.dismiss_message = function (studentData) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(ta_room).emit("dismissMessage", {
        andrewID: studentData.andrewID,
        data: {
            studentData: studentData
        }
    });
}

exports.approveCooldown = function (studentData) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("approveCooldown", {
        andrewID: studentData.andrewID,
        data: {
            studentData: studentData
        }
    });
}
