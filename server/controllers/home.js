// For Home page
const moment = require('moment-timezone');
const Promise = require('bluebird');
const Sequelize = require('sequelize');

const queue = require('./queue');
const models = require('../models');
const sockets = require('./sockets');
const settings = require('./settings');

const OHQueue = queue.OHQueue;
const StudentStatus = queue.StudentStatus;

// default queue frozen property
let queueFrozen = false;

const ohq = new queue.OHQueue();

let waitTime = 20;

/** Helper Functions **/
function respond_error(req, res, message, status) {
    res.status(status);
    res.json({message: message});
}

function respond(req, res, message, data, status) {
    res.status(status);
    if (message) {
        data['message'] = message;
    }
    res.json(data);
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
            waitTime: waitTime,
            isAuthenticated: req.user?.isAuthenticated,
            isTA: req.user?.isTA,
            isAdmin: req.user?.isAdmin,
            andrewID: req.user?.andrewID
        },
        studentData: {}
    };

    models.assignment_semester.findAll({
        where: {
            sem_id: settings.get_admin_settings().currSem,
            start_date: {[Sequelize.Op.lt]: new Date()},
            end_date: {[Sequelize.Op.gt]: new Date()}
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

        // Handle when logged-in user is a student
        if (req.user.isAuthenticated && !req.user.isTA) {
            data.studentData["position"] = ohq.getPosition(req.user.student.student_id);

            if (data.studentData.position !== -1) {
                // doesn't include question ID because it doesn't need to be passed to client
                let entry = ohq.queue.get(data.studentData.position);
                data.studentData["status"] = entry.status;
                data.studentData["isFrozen"] = entry.isFrozen;
                data.studentData["question"] = entry.question;
                data.studentData["location"] = entry.location;
                data.studentData["topic"] = entry.topic;
            }
        }
        res.send(data);
    });
}

exports.post_freeze_queue = function (req, res) {
    if (!req.user || !req.user.isTA) {
        return;
    }

    queueFrozen = true;
    res.redirect("/");
}

exports.post_unfreeze_queue = function (req, res) {
    if (!req.user || !req.user.isTA) {
        return;
    }

    queueFrozen = false;
    res.redirect("/");
}

/** Announcements */
/** 
 * {
 *     id: int,
 *     header: string,
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

    var header = req.body.header;
    var content = req.body.content;
    if (!header || !content) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    announcements.push({
        id: announcementId,
        header: header,
        content: content
    });
    announcementId++;

    respond(req, res, `Announcement created successfully`, { announcements: announcements }, 200);
}

exports.post_update_announcement = function (req, res) {
    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    var id = req.body.id;
    var header = req.body.header;
    var content = req.body.content;
    if (!header || !content) {
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
        header: header,
        content: content
    }
    // TODO: clear all read cookies once updated, will eventually be handled by sockets
    
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
    
    respond(req, res, `Announcement deleted successfully`, { announcements: announcements }, 200);
}

/** Questions */
exports.post_add_question = function (req, res) {
    if (!req.user || !req.user.isAuthenticated) {
        res.status(403)
        res.json({message: 'Invalid permissions to perform this action'})
        return
    }

    let id = req.user.student?.student_id;
    
    if (req.user.isTA) {
        id = req.body.andrewID;
    }

    if (!id) {
        res.status(400);
        res.json({message: 'Invalid student ID'});
        return;
    }

    if (ohq.getPosition(id) != -1) {
        res.status(400);
        res.json({message: 'Student already on the queue'});
        return;
    }
    
    ohq.enqueue(
        id,
        req.body.andrewID,
        req.body.question, 
        req.body.location, 
        req.body.topic,
        moment.tz(new Date(), "America/New_York").toDate()
    )

    let data = {
        status: ohq.getStatus(id),
        position: ohq.getPosition(id)
    }

    if(data.status != null && data.position != null) {
        res.status(200)
        data['message'] = "Successfully added to queue";
        res.json(data)
    } else if (data.status == 5 || data.position == -1) {
        res.status(400)
        res.json({message: 'The server was unable to find you on the queue after adding you'})
    } else {
        res.status(500)
        res.json({message: 'The server was unable to add you to the queue'})
    }

    ohq.print()
}

exports.post_remove_student = function(req, res) {
    if (!req.user) {
        res.status(400)
        res.json({message: 'user data not passed to server'})
        return
    } 
    
    if (ohq.getPosition(req.user.student.student_id) === -1) {
        res.status(400)
        res.json({message: 'student not on the queue'})
        return
    }

    let id = req.user.student.student_id

    ohq.remove(id)

    if(ohq.getPosition(id) != -1) {
        res.status(500)
        res.json({message: "the server was unable to remove you from the queue"})
    }

    let data = {
        'message': "successfully removed from the queue"
    }
    
    res.status(200)
    res.json(data)
}

exports.get_display_students = function(req, res) {
    // assuming that students at front of queue go first
    var allStudents = ohq.getAllStudentData();
    allStudents = allStudents.map((student) => {
        let studentEntryData = {
            name: "who are you :(", // TODO: update queue to store actual name of student
            andrewID: student.andrewID, 
            topic: student.topic.name,
            question: student.question,
            status: student.status
        }

        return studentEntryData;

        })
        
    res.status(200);
    res.send(allStudents);
}