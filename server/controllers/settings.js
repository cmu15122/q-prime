// For settings page
const moment = require("moment-timezone");

const db = require('../database/models');

exports.get = function (req, res) {
    // TODO: use req to get access token and check for user status

    db.assignment_semester.findAll({
        order: [['end_date', 'ASC']]
    }).then(async function(results) {
        let assignments = [];

        for (const assignmentSem of results) {
            let assignment = await db.assignment.findOne({
                where: { assignment_id: assignmentSem.dataValues.assignment_id }
            })
            if (assignment != null) {
                assignments.push({
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

exports.post_add_topic = function (req, res) {
    // TODO: use req to get access token and check for user status

    var name = req.body.name;
    var category = req.body.category;
    var start_date = moment.tz(new Date(req.body.start_date), "America/New_York").toDate(); // TODO: get timezone
    var end_date = moment.tz(new Date(req.body.end_date), "America/New_York").toDate();
    if (!start_date.getTime() || !end_date.getTime() || !name || !category) {
        res.status(500);
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
                sem_id: 'S22'
            }
        }).then(function([semester, created]) {
            db.assignment_semester.create({
                assignment_id: assignment.assignment_id,
                semester_id: semester.sem_id,
                sem_id: semester.sem_id,
                start_date: start_date,
                end_date: end_date
            });
        });
    });

    res.redirect("/settings");
}

