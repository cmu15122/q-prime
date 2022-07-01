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

exports.get = function (req, res) {
    res.status(200);
    res.send({ 
        title: "15-122 Office Hours Queue",
        queueFrozen: queueFrozen,
        numStudents: ohq.size(),
        waitTime: waitTime,
        isAuthenticated: req.user?.isAuthenticated,
        isTA: req.user?.isTA,
        isAdmin: req.user?.isAdmin
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

exports.post_add_question = function (req, res) {
    // fields we get from client
    const question = req.body.question
    const location = req.body.location
    const topic = req.body.topic

    // TODO: error handling 

    // add qn to the queue
    const studentID = req.user.account.user_id
    ohq.enqueue(studentID);
    const position = ohq.getPosition()

    // add qn to the database
    
}