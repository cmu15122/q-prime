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

exports.getOHQ = function () {
    return ohq;
};

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

function buildQueueData() {
    let adminSettings = settings.get_admin_settings();

    let data = {
        // most important global data
        title: "15-122 Office Hours Queue",
        uninitializedSem: adminSettings.currSem == null,
        queueFrozen: queueFrozen,

        // global stats
        numStudents: ohq.size(),
        rejoinTime: adminSettings.rejoinTime,

        announcements: announcements,

        topics: [],
        locations: settings.internal_get_locations(),
        tas: []
    };

    return models.assignment_semester.findAll({
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

        return models.semester_user.findAll({
            where: { sem_id: adminSettings.currSem, is_ta: 1 },
            include: [
                {
                    model: models.account,
                    include: [{ model: models.ta, as: "ta" }],
                }
            ],
            order: [['account', 'preferred_name', 'ASC']]
        })
    }).then((results) => {
        let tas = [];

        for (const semUser of results) {
            let account = semUser.account;
            let ta = account.ta;
            tas.push({
                ta_id: ta.ta_id,
                name: account.name,
                preferred_name: account.preferred_name,
                email: account.email,
                isAdmin: ta.is_admin == 1
            });
        }

        data.tas = tas;

        return waittime.wait_time_data();
    }).then((waitTimeData) => {
        data.numUnhelped = waitTimeData.numUnhelped;
        data.minsPerStudent = waitTimeData.minsPerStudent;
        data.numTAs = waitTimeData.numTAs;

        return data;
    });
}

function emitNewQueueData() {
    buildQueueData().then((data) => {
        sockets.queueData(data);
    });
}
exports.emit_new_queue_data = emitNewQueueData;

exports.get = function (req, res) {
    buildQueueData().then((data) => {
        respond(req, res, 'Successfully retrieved queue data', data, 200);
    }).catch((err) => {
        console.log(err);
        respond_error(req, res, `Error retrieving queue data ${err.toString()}`, 500);
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
            preferredName: req.user.account ? req.user.account.dataValues.preferred_name : '',
        }
    }

    if (!data.userData.isOwner && data.userData.isTA) {
        data.userData = {
            ...data.userData,
            taSettings: {
                videoChatEnabled: req.user.account.dataValues.settings.videoChatEnabled,
                videoChatURL: req.user.ta.dataValues.zoom_url,
                joinNotifsEnabled: req.user.account.dataValues.settings.joinNotifsEnabled,
                remindNotifsEnabled: req.user.account.dataValues.settings.remindNotifsEnabled,
                remindTime: req.user.account.dataValues.settings.remindTime,
            }
        }
    }

    respond(req, res, 'Successfully retrieved user data', data, 200);
    return;
}

exports.get_student_data = function (req, res) {
    let data = {
        name: '',
        andrewID: req.user.andrewID,
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
        respond(req, res, 'Successfully retrieved student data', data, 200)
        return;
    } else {
        respond(req, res, 'Successfully retrieved student data', buildStudentEntryData(ohq.queue.get(studentPos)), 200)
        return;
    }
}

/**
 *
 * @param {*} studentAndrewID
 */
function emitNewStudentData(studentAndrewID) {
    let data = ohq.getData(studentAndrewID)

    if (data !== StudentStatus.ERROR) {
        sockets.studentData(buildStudentEntryData(ohq.getData(studentAndrewID)));
    } else {
        sockets.studentData({
            name: '',
            andrewID: studentAndrewID,
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
        });
    }
}

function buildAllStudents() {
    // assuming that students at front of queue go first
    let allStudents = ohq.getAllStudentData();
    allStudents = allStudents.map((student) => {
        let studentEntryData = buildStudentEntryData(student);
        return studentEntryData;
    })

    return allStudents;
}

exports.get_all_students = function (req, res) {
    respond(req, res, 'Successfully retrieved all students', {allStudents: buildAllStudents()}, 200);
}

function emitNewAllStudents() {
    sockets.allStudents(buildAllStudents());
}

exports.post_freeze_queue = function (req, res) {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, 'You do not have permissions to perform this operation', 403);
        return;
    }

    queueFrozen = true;
    emitNewQueueData()
    respond(req, res, 'Successfully froze queue', {}, 200)
}

exports.post_unfreeze_queue = function (req, res) {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, 'You do not have permissions to perform this operation', 403);
        return;
    }

    queueFrozen = false;
    emitNewQueueData()
    respond(req, res, 'Successfully unfroze queue', {}, 200)
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
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
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

    emitNewQueueData()
    respond(req, res, `Announcement created successfully`, { announcements: announcements }, 200);
}

exports.post_update_announcement = function (req, res) {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
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
    emitNewQueueData()
    respond(req, res, `Announcement updated successfully`, { announcements: announcements }, 200);
}

exports.post_delete_announcement = function (req, res) {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    let id = req.body.id;
    let index = announcements.findIndex(announcement => announcement.id == id);
    if (index < 0) {
        respond_error(req, res, "Announcement ID not found", 500);
        return;
    }

    announcements.splice(index, 1);
    emitNewQueueData()
    respond(req, res, `Announcement deleted successfully`, { announcements: announcements }, 200);
}

/** Questions */
exports.post_add_question = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    let id = req.body.andrewID;
    let overrideCooldown = req.user.isTA || req.body.overrideCooldown;

    if (ohq.getPosition(id) != -1) {
        respond_error(req, res, "Student already on the queue", 400);
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

            respond(req, res, `Successfully added to queue`, data, 200);

            sockets.add({
                name: account.preferred_name,
                andrewID: id,
                topic: req.body.topic,
            });

            emitNewQueueData();
            emitNewStudentData(id);
            emitNewAllStudents();
        }
    }).catch((err) => {
        console.log(err);
        respond__error(req, res, err.message, 500);
    });
}

exports.post_remove_student = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        respond_error(req, res, "User data not passed to server", 400);
        return;
    }

    let id = req.body.andrewID;
    let taID = req.user.isTA ? req.user.ta.ta_id : null;

    if (ohq.getPosition(id) === -1) {
        respond_error(req, res, "Student not on the queue", 400)
        return;
    }

    let returnedData = ohq.remove(id);

    if (ohq.getPosition(id) != -1) {
        respond_error(req, res, "The server was unable to remove the student from the queue", 500);
        return;
    }

    sockets.remove(id);

    emitNewQueueData();
    emitNewStudentData(id);
    emitNewAllStudents();

    // this necessary as places move up
    ohq.getAllStudentData().forEach((student) => {
        emitNewStudentData(student.andrewID);
    });

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
        respond(req, res, 'The student was successfully removed form the queue and a question record was added to the database', {question_id: results.question.question_id}, 200);
    }).catch((err) => {
        console.log(err);
        respond_error(req, res, 'The student was removed from the queue but an error occurred adding the question to the database', 500);
    })
}

exports.post_help_student = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        respond_error(req, res, "User data not passed to server", 400);
        return
    }
    else if (!req.user.isTA) {
        respond_error(req, res, "This request was not made by a TA", 400);
        return
    }

    let id = req.body.andrewID

    if (ohq.getPosition(id) === -1) {
        respond_error(req, res, "Student not on the queue", 400);
        return
    }
    if (ohq.getStatus(id) === StudentStatus.BEING_HELPED) {
        respond_error(req, res, "Student is already being helped", 400);
        return
    }

    ohq.help(id, req.user.ta.ta_id, req.user.andrewID, moment.tz(new Date(), "America/New_York").toDate());
    sockets.help(id, req.user.account);

    emitNewQueueData();
    emitNewStudentData(id);
    emitNewAllStudents();

    respond(req, res, 'The student was helped', {}, 200);
}

exports.post_unhelp_student = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        respond_error(req, res, "User data not passed to server", 400);
        return
    }
    else if (!req.user.isTA) {
        respond_error(req, res, "This request was not made by a TA", 400);
        return
    }

    let id = req.body.andrewID
    if (ohq.getPosition(id) === -1) {
        respond_error(req, res, "Student not on the queue", 400);
        return
    }
    if (ohq.getStatus(id) != StudentStatus.BEING_HELPED) {
        respond_error(req, res, "Student was not being helped", 400);
        return
    }

    ohq.unhelp(id);
    sockets.unhelp(id, req.user.andrewID);

    emitNewQueueData();
    emitNewStudentData(id);
    emitNewAllStudents();

    respond(req, res, 'The student was unhelped', {}, 200);
}

exports.post_update_question = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        respond_error(req, res, "User data not passed to server", 400);
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

    emitNewStudentData(id);
    emitNewAllStudents();

    respond(req, res, 'Question updated successfully', studentData, 200);
}

exports.post_taRequestUpdateQ = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        respond_error(req, res, "User data not passed to server", 400);
    }
    else if (!req.user.isTA) {
        respond_error(req, res, "This request was not made by a TA", 400);
        return
    }

    let id = req.body.andrewID

    if (ohq.getPosition(id) === -1) {
        respond_error(req, res, "Student not on the queue", 400);
        return
    }
    if (ohq.getStatus(id) === StudentStatus.FIXING_QUESTION) {
        respond_error(req, res, "Student is already fixing question", 400);
        return
    }

    ohq.setFixQuestion(id);

    sockets.updateQRequest(id);
    emitNewStudentData(id);
    emitNewAllStudents();

    respond(req, res, 'Update question request sent successfully', req.body, 200);
}

exports.post_message_student = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        respond_error(req, res, "User data not passed to server", 400);
        return;
    } else if (!req.user.isTA) {
        respond_error(req, res, "This request was not made by a TA", 400);
        return;
    }

    let id = req.body.andrewID;
    let message = req.body.message;

    if (ohq.getPosition(id) === -1) {
        respond_error(req, res, "Student not on the queue", 400);
        return;
    }
    if (ohq.getStatus(id) == StudentStatus.BEING_HELPED) {
        respond_error(req, res, "Student is being helped and can not receive a message", 400);
        return;
    }

    ohq.receiveMessage(id, req.user.ta.ta_id, req.user.andrewID, message);

    sockets.message(id, req.user.account);
    emitNewStudentData(id);
    emitNewAllStudents();

    respond(req, res, 'The student was messaged', {}, 200);
}

exports.post_dismiss_message = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        respond_error(req, res, "User data not passed to server", 400);
        return;
    }

    let id = req.body.andrewID;

    if (ohq.getPosition(id) === -1) {
        respond_error(req, res, "Student not on the queue", 400);
        return;
    }
    if (ohq.getStatus(id) != StudentStatus.RECEIVED_MESSAGE) {
        respond_error(req, res, "Student did not receive a message", 400);
        return;
    }

    ohq.dismissMessage(id);

    sockets.dismiss_message(id);
    emitNewStudentData(id);
    emitNewAllStudents();

    respond(req, res, 'The message was dismissed', {}, 200);
}

exports.post_approve_cooldown_override = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        respond_error(req, res, "User data not passed to server", 400);
        return
    }
    else if (!req.user.isTA) {
        respond_error(req, res, "This request was not made by a TA", 400);
        return
    }

    let id = req.body.andrewID
    if (ohq.getPosition(id) === -1) {
        respond_error(req, res, "Student not on the queue", 400);
        return
    }
    if (ohq.getStatus(id) != StudentStatus.COOLDOWN_VIOLATION) {
        respond_error(req, res, "Student was not on cooldown violation", 400);
        return
    }

    ohq.unsetCooldownViolation(id);

    sockets.approveCooldown(id);
    emitNewStudentData(id);
    emitNewAllStudents();

    respond(req, res, 'The cooldown violation was approved', {}, 200);
}
