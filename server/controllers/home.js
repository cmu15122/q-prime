// For Home page
const queue = require('./queue');

const OHQueue = queue.OHQueue;
const StudentStatus = queue.StudentStatus;

const ohq = new queue.OHQueue();
var queueFrozen = false;

exports.get = function (req, res) {
    res.send({ 
        title: "Home Page",
        frozen: queueFrozen
    });
}
