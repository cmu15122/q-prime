// For Home page
const Promise = require('bluebird');

const queue = require('./queue');
const models = require('../models');
const sockets = require('./sockets');

const OHQueue = queue.OHQueue;
const StudentStatus = queue.StudentStatus;

let queueFrozen = true;

const ohq = new queue.OHQueue();

/** Dummy information for testing */
ohq.enqueue("student1");
ohq.enqueue("student2");
ohq.enqueue("student3");

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
    res.send({ 
        title: "15-122 Office Hours Queue",
        announcements: announcements,
        queueFrozen: queueFrozen,
        numStudents: ohq.size(),
        waitTime: waitTime,
        isAuthenticated: req.user?.isAuthenticated,
        isTA: req.user?.isTA,
        isAdmin: req.user?.isAdmin,
        andrewID: req.user?.andrewID
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
