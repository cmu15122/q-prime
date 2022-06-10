// For Home page
const queue = require('./queue');

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
        title: "Home Page",
        queueFrozen: queueFrozen,
        numStudents: ohq.size(),
        waitTime: waitTime
    });
}

exports.post_freeze_queue = function (req, res) {
    queueFrozen = true;
    res.redirect("/");
}

exports.post_unfreeze_queue = function (req, res) {
    queueFrozen = false;
    res.redirect("/");
}
