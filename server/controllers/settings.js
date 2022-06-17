// For settings page
const moment = require("moment-timezone");

const db = require('../database/models');

exports.get = function (req, res) {
    // TODO: use req to get access token and check for user status

    db.assignment_semester.findAll({
        include: [{model: db.assignment, as: "assignment"}],
        order: [['end_date', 'ASC']]
    }).then(function(results) {
        res.status(200);
        res.send({ 
            title: "15-122 Office Hours Queue | Settings",
            topics: results,
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
            name: name
        },
        defaults: {
            name: name,
            category: category
        } 
    }).then(function([assignment, created]) {
        db.assignment_semester.create({
            assignmentId: assignment.id,
            start_date: start_date,
            end_date: end_date
        });
    });

    res.redirect("/settings");
}

