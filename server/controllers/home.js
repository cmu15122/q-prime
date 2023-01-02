// For Home page
const moment = require('moment-timezone');
const Promise = require('bluebird');
const Sequelize = require('sequelize');

const queue = require('./queue');
const models = require('../models');
const sockets = require('./sockets');
const waittime = require('./waittimes')
const settings = require('./settings');

const StudentStatus = queue.StudentStatus;

// default queue frozen property
let queueFrozen = false;

const ohq = new queue.OHQueue();

/** Helper Functions **/
function respond_error(req, res, message, status) {
    res.status(status);
    res.json({ message: message });
}

function respond(req, res, message, data, status) {
    res.status(status);
    if (message) {
        data['message'] = message;
    }
    res.json(data);
}

exports.getOHQ = function () {
    return ohq;
};

function buildStudentEntryData(student) {
    let studentPos = ohq.getPosition(student.andrewID); //TODO: Should find cheaper way to grab this
    let studentEntryData = {
        name: student.preferredName,
        andrewID: student.andrewID,
        taID: student.taID,
        taAndrewID: student.taAndrewID,
        location: student.location,
        topic: student.topic,
        question: student.question,
        status: student.status,
        isFrozen: student.isFrozen,
        message: student.message,
        messageBuffer: student.messageBuffer,
        position: studentPos,
    }

    return studentEntryData;
}

exports.get = function (req, res) {
    res.status(200);

    // default data to send back
    let adminSettings = settings.get_admin_settings();
    let data = {
        // most important global data
        title: "15-122 Office Hours Queue",
        uninitializedSem: adminSettings.currSem == null,
        queueFrozen: queueFrozen,

        // global stats
        numStudents: ohq.size(),
        rejoinTime: adminSettings.rejoinTime,
        waitTime: waittime.get(),
        numUnhelped: 5, // TODO Add waittimes functionality here
        minsPerStudent: 5,
        numTAs: 5,

        announcements: announcements,

        topics: [],
        locations: settings.internal_get_locations,
    };

    models.assignment_semester.findAll({
        where: {
            sem_id: adminSettings.currSem,
            start_date: { [Sequelize.Op.lt]: new Date() },
            end_date: { [Sequelize.Op.gt]: new Date() }
        },
        order: [['end_date', 'ASC']],
        include: models.assignment
    }).then((results) => {
        let assignments = [];

        for (const assignmentSem of results) {
            let assignment = assignmentSem.assignment;
            assignments.push({
                assignment_id: assignmentSem.assignment_id,
                name: assignment.name
            });
        }

        data.topics = assignments;

        res.send(data);
        return;
    });
}

exports.get_user_data = function (req, res) {
    let data = {
        userData: {
            isOwner: req.user.isOwner,
            isAuthenticated: req.user.isAuthenticated,
            isTA: req.user.isTA,
            isAdmin: req.user.isAdmin,
            andrewID: req.user.andrewID,
            preferredName: req.user.account ? req.user.account.preferredName : '',
        }
    }

    if (!data.userData.isOwner && data.userData.isTA) {
        data.userData = {
            ...data.userData,
            taSettings: {
                videoChatEnabled: req.user.account.settings.videoChatEnabled,
                videoChatURL: req.user.account.settings.videoChatURL,
                joinNotifsEnabled: req.user.account.settings.joinNotifsEnabled,
                remindNotifsEnabled: req.user.account.settings.remindNotifsEnabled,
                remindTime: req.user.account.settings.remindTime,
            }
        }
    }

    res.status(200);
    res.send(data);
    return;
}

exports.get_student_data = function (req, res) {
    let data = {
        name: '',
        andrewID: '',
        taID: -1,
        taAndrewID: '',
        location: '',
        topic: '',
        question: '',
        isFrozen: false,
        message: '',
        messageBuffer: [],
        status: -1,
        position: -1,
    }

    // Handle when logged-in user is a student
    let studentPos = ohq.getPosition(req.user.andrewID);
    if (studentPos === -1) {
        // Student is not on the queue
        res.send(data);
        return;
    } else {
        res.send(buildStudentEntryData(ohq.queue.get(studentPos)));
        return;
    }

    // if (entry.status === StudentStatus.BEING_HELPED || entry.status === StudentStatus.RECEIVED_MESSAGE) {
    //     models.account.findOne({
    //         where: { user_id: entry.taID },
    //         include: {
    //             model: models.ta,
    //             as: 'ta'
    //         }
    //     }).then(function (account) {
    //         data.studentData.helpingTA = {
    //             taId: account.ta.ta_id,
    //             taName: account.name,
    //             taZoomUrl: account.ta.zoom_url
    //         }
    //         res.send(data);
    //     });
    // }
    // else {
    //     res.send(data);
    // }
}

exports.post_freeze_queue = function (req, res) {
    if (!req.user || !req.user.isTA) {
        return;
    }

    queueFrozen = true;
    sockets.queueFrozen(queueFrozen);
}

exports.post_unfreeze_queue = function (req, res) {
    if (!req.user || !req.user.isTA) {
        return;
    }

    queueFrozen = false;
    sockets.queueFrozen(queueFrozen);
}

/** Announcements */
/**
 * {
 *     id: int,
 *     content: string
 * }
 */
let announcements = [];
let announcementId = 0;

exports.post_create_announcement = function (req, res) {
    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    var content = req.body.content;
    if (!content) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    let announcement = {
        id: announcementId,
        content: content
    };

    announcements.push(announcement);
    announcementId++;

    sockets.addAnnouncement(announcement);
    respond(req, res, `Announcement created successfully`, { announcements: announcements }, 200);
}

exports.post_update_announcement = function (req, res) {
    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    var id = req.body.id;
    var content = req.body.content;
    if (!content) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    let index = announcements.findIndex(announcement => announcement.id == id);
    if (index < 0) {
        respond_error(req, res, "Announcement ID not found", 500);
        return;
    }

    announcements[index] = {
        id: id,
        content: content
    }
    sockets.updateAnnouncement(id, announcements[index]);
    respond(req, res, `Announcement updated successfully`, { announcements: announcements }, 200);
}

exports.post_delete_announcement = function (req, res) {
    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    let id = req.body.id;
    let index = announcements.findIndex(announcement => announcement.id == id);
    if (index < 0) {
        respond_error(req, res, "Announcement ID not found", 500);
        return;
    }

    announcements.splice(index, 1);
    sockets.deleteAnnouncement(id);
    respond(req, res, `Announcement deleted successfully`, { announcements: announcements }, 200);
}

/** Questions */
exports.post_add_question = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(403);
        res.json({ message: 'Invalid permissions to perform this action' });
        return;
    }

    let id = req.body.andrewID;
    let overrideCooldown = req.user.isTA || req.body.overrideCooldown;

    if (ohq.getPosition(id) != -1) {
        res.status(400);
        res.json({ message: 'Student already on the queue' });
        return;
    }

    models.account.findOrCreate({ // TODO: change to findOne after adding permanent students to database
        where: {
            email: {
                [Sequelize.Op.like]: id + '@%'
            }
        },
        defaults: {
            name: req.body.name ? req.body.name : 'No Name',
            preferred_name: req.body.name ? req.body.name : 'No Name',
            email: id + '@andrew.cmu.edu'
        }
    }).then(([account, created]) => {
        if (!account) {
            throw new Error('No existing account with provided andrew ID.');
        }

        return Promise.props({
            student: models.student.findOrCreate({ // TODO: change to findOne after adding permanent students to database
                where: {
                    student_id: account.user_id
                }
            }),
            account: account
        });
    }).then((result) => {
        let [student, created] = result.student;
        let account = result.account;

        if (!student) {
            throw new Error('No existing student account with provided andrew ID.');
        }

        // check for cooldown violation
        let rejoinTime = settings.get_admin_settings().rejoinTime
        return Promise.props({
            questions: models.question.findAll({
                where: {
                    exit_time: {
                        [Sequelize.Op.gte]: moment.tz(new Date(), "America/New_York").subtract(rejoinTime, 'minutes').toDate(),
                    },
                    help_time: {
                        [Sequelize.Op.ne]: null,
                    },
                    student_id: student.student_id
                }
            }),
            account: account
        })
    }).then((result) => {
        let questions = result.questions.sort((firstQ, secondQ) => {
            return moment.tz(firstQ.exit_time, "America/New_York").diff(secondQ.exit_time)
        })

        let account = result.account

        // fail if cooldown violated
        if (!overrideCooldown && questions.length > 0) {
            res.status(200)
            res.json({
                message: "cooldown_violation",
                timePassed: `${moment.tz(new Date(), "America/New_York").diff(questions[questions.length - 1].exit_time, 'minutes')}`
            })
        } else {
            ohq.enqueue(
                id,
                account.preferred_name,
                req.body.question,
                req.body.location,
                req.body.topic,
                moment.tz(new Date(), "America/New_York").toDate()
            );

            let data = {
                status: ohq.getStatus(id),
                position: ohq.getPosition(id)
            };

            if (data.status == null || data.position == null) {
                throw new Error('The server was unable to add you to the queue');
            } else if (data.status == -1 || data.position == -1) {
                throw new Error('The server was unable to find you on the queue after adding you');
            }

            if (overrideCooldown && !req.user.isTA) {
                ohq.setCooldownViolation(id)
            }

            res.status(200);
            data['message'] = "Successfully added to queue";
            res.json(data);

            let studentEntryData = buildStudentEntryData(ohq.getData(id));
            sockets.add(studentEntryData);
        }
    }).catch((err) => {
        console.log(err);
        res.status(500);
        res.json({ message: err.message });
    });
}

exports.post_remove_student = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(400);
        res.json({ message: 'User data not passed to server' });
        return;
    }

    let id = req.body.andrewID;
    let taID = req.user.isTA ? req.user.ta.ta_id : null;

    if (ohq.getPosition(id) === -1) {
        res.status(400);
        res.json({ message: 'Student not on the queue' });
        return;
    }

    let returnedData = ohq.remove(id);

    if (ohq.getPosition(id) != -1) {
        res.status(500);
        res.json({ message: "The server was unable to remove the student from the queue" });
        return;
    }

    sockets.remove(id, returnedData);

    // TODO, FIXME: Don't write TA added questions to the database or TA manually removed questions
    models.account.findOrCreate({
        where: {
            email: {
                [Sequelize.Op.like]: returnedData.andrewID + '@%'
            }
        },
        defaults: {
            email: returnedData.andrewID + '@andrew.cmu.edu'
        }
    }).then(([account,]) => {
        return Promise.props({
            account: account,
            student: models.student.findOrCreate({
                where: {
                    student_id: account.user_id
                }
            })
        });
    }).then((results) => {
        return Promise.props({
            account: results.account,
            student: results.student[0],
            question: models.question.create({
                ta_id: taID,
                student_id: results.student[0].student_id,
                sem_id: settings.get_admin_settings().currSem,
                question: returnedData.question,
                location: returnedData.location,
                assignment: returnedData.topic.assignment_id,
                entry_time: returnedData.entryTime,
                help_time: returnedData.helpTime,
                exit_time: moment.tz(new Date(), "America/New_York").toDate(),
                num_asked_to_fix: returnedData.numAskedToFix
            })
        });
    }).then((results) => {
        res.status(200);
        res.json({
            message: 'The student was successfully removed form the queue and a question record was added to the database',
            question_id: results.question.question_id,
        });
    }).catch((err) => {
        console.log(err);
        res.status(500);
        res.json({
            message: 'The student was removed from the queue but an error occurred adding the question to the database'
        });
    })
}

exports.post_help_student = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(400)
        res.json({ message: 'User data not passed to server' })
        return
    }
    else if (!req.user.isTA) {
        console.log(req.user)
        res.status(400)
        res.json({ message: 'This request was not made by a TA' })
        return
    }

    let id = req.body.andrewID

    if (ohq.getPosition(id) === -1) {
        res.status(400)
        res.json({ message: 'Student not on the queue' })
        return
    }
    if (ohq.getStatus(id) === StudentStatus.BEING_HELPED) {
        res.status(400)
        res.json({ message: 'Student is already being helped' })
        return
    }

    ohq.help(id, req.user.ta.ta_id, req.user.andrewID, moment.tz(new Date(), "America/New_York").toDate());
    let student = ohq.getData(id);
    let studentEntryData = buildStudentEntryData(student);
    let taData = req.user.account
    // add a field to studentEntryData to keep track of the TA's preferred name
    studentEntryData["taPrefName"] = taData.preferred_name
    sockets.help(studentEntryData, req.user.account);

    res.status(200)
    res.json({ message: 'The student was helped' })
}

exports.post_unhelp_student = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(400)
        res.json({ message: 'User data not passed to server' })
        return
    }
    else if (!req.user.isTA) {
        console.log(req.user)
        res.status(400)
        res.json({ message: 'This request was not made by a TA' })
        return
    }

    let id = req.body.andrewID
    if (ohq.getPosition(id) === -1) {
        res.status(400)
        res.json({ message: 'Student not on the queue' })
        return
    }
    if (ohq.getStatus(id) != StudentStatus.BEING_HELPED) {
        res.status(400)
        res.json({ message: 'Student was not being helped' })
        return
    }

    ohq.unhelp(id);
    let student = ohq.getData(id);
    let studentEntryData = buildStudentEntryData(student);

    sockets.unhelp(studentEntryData, req.user.andrewID);

    res.status(200);
    res.json({ message: 'The student was unhelped' });
}

exports.post_update_question = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(400);
        res.json({ message: 'User data not passed to server' });
        return;
    }

    let id = req.user.andrewID;
    let newQuestion = req.body.content;
    if (!newQuestion) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    let pos = ohq.getPosition(id);
    if (pos === -1) {
        respond_error(req, res, "Student not yet on the queue", 400);
        return;
    }

    let studentData = ohq.getData(id);

    if (newQuestion == studentData.question) {
        respond_error(req, res, "Question was not updated! Please be sure you've entered a new question", 400);
        return;
    }

    studentData.question = newQuestion;
    ohq.unsetFixQuestion(id);

    let studentEntryData = buildStudentEntryData(studentData);
    sockets.updateQuestion(studentEntryData);

    respond(req, res, 'Question updated successfully', studentData, 200);
}

exports.post_taRequestUpdateQ = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(400)
        res.json({ message: 'User data not passed to server' })
    }
    else if (!req.user.isTA) {
        console.log(req.user)
        res.status(400)
        res.json({ message: 'This request was not made by a TA' })
        return
    }

    let id = req.body.andrewID

    if (ohq.getPosition(id) === -1) {
        res.status(400)
        res.json({ message: 'Student not on the queue' })
        return
    }
    if (ohq.getStatus(id) === StudentStatus.FIXING_QUESTION) {
        res.status(400)
        res.json({ message: 'Student is already fixing question' })
        return
    }

    ohq.setFixQuestion(id);

    let studentData = ohq.getData(id);
    let studentEntryData = buildStudentEntryData(studentData);
    sockets.updateQRequest(studentEntryData);

    respond(req, res, 'Update question request sent successfully', req.body, 200);
}

exports.post_message_student = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(400);
        res.json({ message: 'User data not passed to server' });
        return;
    } else if (!req.user.isTA) {
        res.status(400);
        res.json({ message: 'This request was not made by a TA' });
        return;
    }

    let id = req.body.andrewID;
    let message = req.body.message;

    if (ohq.getPosition(id) === -1) {
        res.status(400);
        res.json({ message: 'Student not on the queue' });
        return;
    }
    if (ohq.getStatus(id) == StudentStatus.BEING_HELPED) {
        res.status(400);
        res.json({ message: 'Student is being helped and can not receive a message' });
        return;
    }

    ohq.receiveMessage(id, req.user.ta.ta_id, req.user.andrewID, message);

    let student = ohq.getData(id);
    let studentEntryData = buildStudentEntryData(student);
    sockets.message(studentEntryData, req.user.account);

    res.status(200);
    res.json({ message: 'The student was messaged' });
}

exports.post_dismiss_message = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(400);
        res.json({ message: 'User data not passed to server' });
        return;
    }

    let id = req.body.andrewID;

    if (ohq.getPosition(id) === -1) {
        res.status(400);
        res.json({ message: 'Student not on the queue' });
        return;
    }
    if (ohq.getStatus(id) != StudentStatus.RECEIVED_MESSAGE) {
        res.status(400);
        res.json({ message: 'Student did not receive a message' });
        return;
    }

    ohq.dismissMessage(id);

    let student = ohq.getData(id);
    let studentEntryData = buildStudentEntryData(student);
    sockets.dismiss_message(studentEntryData);

    res.status(200);
    res.json({ message: 'Message dismissed' });
}

exports.post_approve_cooldown_override = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(400)
        res.json({ message: 'User data not passed to server' })
        return
    }
    else if (!req.user.isTA) {
        console.log(req.user)
        res.status(400)
        res.json({ message: 'This request was not made by a TA' })
        return
    }

    let id = req.body.andrewID
    if (ohq.getPosition(id) === -1) {
        res.status(400)
        res.json({ message: 'Student not on the queue' })
        return
    }
    if (ohq.getStatus(id) != StudentStatus.COOLDOWN_VIOLATION) {
        res.status(400)
        res.json({ message: 'Student was not on cooldown violation' })
        return
    }

    ohq.unsetCooldownViolation(id);

    let student = ohq.getData(id);
    let studentEntryData = buildStudentEntryData(student);
    sockets.approveCooldown(studentEntryData);

    res.status(200)
    res.json({ message: "approved cooldown violation" })
}

exports.get_display_students = async function (req, res) {
    // assuming that students at front of queue go first
    var allStudents = ohq.getAllStudentData();
    allStudents = allStudents.map((student) => {
        let studentEntryData = buildStudentEntryData(student);
        return studentEntryData;
    })

    res.status(200);
    res.send(allStudents);
}
