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

exports.getOHQ = () => {
    return ohq;
}

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

exports.getOHQ = function() {
    return ohq;
};

function buildStudentEntryData(student) {
    let studentEntryData = {
        name: student.preferredName,
        andrewID: student.andrewID,
        taAndrewID: student.taAndrewID,
        topic: student.topic.name,
        question: student.question,
        status: student.status
    }

    return studentEntryData;
}

exports.get = function (req, res) {
    res.status(200);

    if (req.user.isOwner) {
        let data = { isOwner: req.user.isOwner };
        res.send(data);
        return;
    }
    let data = {
        queueData: {
            title: "15-122 Office Hours Queue",
            announcements: announcements,
            queueFrozen: queueFrozen,
            numStudents: ohq.size(),
            waitTime: waittime.get(),
            isAuthenticated: req.user?.isAuthenticated,
            isTA: req.user?.isTA,
            isAdmin: req.user?.isAdmin,
            andrewID: req.user?.andrewID,
            preferred_name: req.user?.account?.preferred_name
        },
        studentData: {}
    };

    if (!req.user.isAuthenticated) {
        // Not logged in - this is all the information we need
        res.send(data);
        return;
    }

    models.assignment_semester.findAll({
        where: {
            sem_id: settings.get_admin_settings().currSem,
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

        data.queueData.topics = assignments;

        if (req.user.isTA) {
            res.send(data);
            return;
        }

        // Handle when logged-in user is a student
        let studentPos = ohq.getPosition(req.user.andrewID);
        data.studentData["position"] = studentPos;

        if (studentPos === -1) {
            // Student is not on the queue
            res.send(data);
            return;
        }

        let entry = ohq.queue.get(studentPos);
        data.studentData["status"] = entry.status;
        data.studentData["isFrozen"] = entry.isFrozen;
        data.studentData["question"] = entry.question;
        data.studentData["location"] = entry.location;
        data.studentData["topic"] = entry.topic;

        if (entry.status === StudentStatus.BEING_HELPED) {
            models.account.findOne({
                where: {user_id: entry.taID},
                include: { 
                    model: models.ta,
                    as: 'ta'
                }
            }).then(function(account) {
                data.studentData.helpingTA = {
                    taId: account.ta.ta_id,
                    taName: account.name,
                    taZoomUrl: account.ta.zoom_url
                }
                res.send(data);
            });
        } 
        else {
            res.send(data);
        }
    });
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
        } else if (data.status == 5 || data.position == -1) {
            throw new Error('The server was unable to find you on the queue after adding you');
        }
    
        res.status(200);
        data['message'] = "Successfully added to queue";
        res.json(data);
    
        let studentEntryData = buildStudentEntryData(ohq.getData(id));
        sockets.add(studentEntryData);
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

    sockets.remove(id);

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
    }).then(([account, ]) => {
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
                assignment: returnedData.topic.topic_id,
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
