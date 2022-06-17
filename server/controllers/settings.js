// For settings page
const moment = require("moment-timezone");

const db = require('../database/models');

let currSem = "S22" //TODO: grab the current semester from somewhere instead of creating it here

exports.get = function (req, res) {
    // TODO: use req to get access token and check for user status
    db.assignment_semester.findAll({
        where: { sem_id: currSem },
        order: [['end_date', 'ASC']]
    }).then(async function(results) {
        let assignments = [];

        for (const assignmentSem of results) {
            let assignment = await db.assignment.findOne({
                where: { assignment_id: assignmentSem.dataValues.assignment_id }
            })
            if (assignment != null) {
                assignments.push({
                    assignment_id: assignmentSem.dataValues.assignment_id,
                    name: assignment.dataValues.name,
                    category: assignment.dataValues.category,
                    start_date: assignmentSem.dataValues.start_date,
                    end_date: assignmentSem.dataValues.end_date,
                });
            }
        }

        res.status(200);
        res.send({ 
            title: "15-122 Office Hours Queue | Settings",
            topics: assignments,
            isAuthenticated: true,
            isTA: true,
            isAdmin: true
        });
    });
}

exports.post_create_topic = function (req, res) {
    // TODO: use req to get access token and check for user status

    var name = req.body.name;
    var category = req.body.category;
    var start_date = moment.tz(new Date(req.body.start_date), "America/New_York").toDate(); // TODO: get timezone (get from client? global config?)
    var end_date = moment.tz(new Date(req.body.end_date), "America/New_York").toDate();
    if (!start_date.getTime() || !end_date.getTime() || !name || !category) {
        res.status(500); // TODO: add correct status codes + error messages, etc.
        return;
    }

    db.assignment.findOrCreate({ 
        where: { 
            name: name,
            category: category
        }
    }).then(function([assignment, created]) {
        db.semester.findOrCreate({ 
            where: { 
                sem_id: currSem
            }
        }).then(function([semester, created]) {
            db.assignment_semester.create({
                assignment_id: assignment.assignment_id,
                sem_id: semester.sem_id,
                start_date: start_date,
                end_date: end_date
            }).then(function() {
                res.redirect("/settings");
            });
        });
    });
}

exports.post_update_topic = function (req, res) {
    // TODO: use req to get access token and check for user status

    var assignment_id = req.body.assignment_id;
    var name = req.body.name;
    var category = req.body.category;
    var start_date = moment.tz(new Date(req.body.start_date), "America/New_York").toDate(); // TODO: get timezone (get from client? global config?)
    var end_date = moment.tz(new Date(req.body.end_date), "America/New_York").toDate();
    if (!start_date.getTime() || !end_date.getTime() || !name || !category || !assignment_id) {
        res.status(500); // TODO: add correct status codes + error messages, etc.
        return;
    }

    db.assignment_semester.findOne({ 
        where: { 
            assignment_id: assignment_id,
            sem_id: currSem
        }
    }).then(function(assignment_semester) {
        if (assignment_semester == null) {
            res.status(500); // TODO: add correct status codes + error messages, etc.
            return;
        }
       
        assignment_semester.set({
            start_date: start_date,
            end_date: end_date
        });
        assignment_semester.save().then(function () {
            db.assignment.findOne({ 
                where: { 
                    assignment_id: assignment_id
                }
            }).then(function(assignment) {
                if (assignment == null) {
                    res.status(500); // TODO: add correct status codes + error messages, etc.
                    return;
                }

                assignment.set({
                    name: name,
                    category: category
                });

                assignment.save().then(function() {
                    res.redirect("/settings");
                })
            });
        });
    });
}

exports.post_delete_topic = function (req, res) {
    // TODO: use req to get access token and check for user status

    var assignment_id = req.body.assignment_id;
    if (!assignment_id) {
        res.status(500); // TODO: add correct status codes + error messages, etc.
        return;
    }

    db.assignment.destroy({ 
        where: { 
            assignment_id: assignment_id
        }
    }).then(function() {
        res.redirect("/settings");
    });
}
