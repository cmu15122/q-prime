// For settings page
const moment = require("moment-timezone");
const Promise = require("bluebird");

const models = require('../models');
const slack = require('./slack');

// Global admin settings
// FIXME: some default values are set to simplify testing;
// In production, these should be cleared
let adminSettings = {
    currSem: "S22", 
    slackURL: null,
    questionsURL: null,
    rejoinTime: 0
};

exports.get_admin_settings = function() {
    return adminSettings;
}

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

function get_response(req, res, message = null) {
    if (!req.user || !req.user.isTA) {
        return;
    }

    Promise.props({
        assignment_semesters: function() {
            if (!adminSettings.currSem) return [];

            return models.assignment_semester.findAll({
                where: { sem_id: adminSettings.currSem },
                include: models.assignment,
                order: [['end_date', 'ASC']]
            });
        }(),
        semester_users: function() {
            if (!adminSettings.currSem) return [];

            return models.semester_user.findAll({
                where: { sem_id: adminSettings.currSem, is_ta: 1 },
                include: [ models.account ]
            })
        }()
    }).then(async function(results) {
        let assignments = [];
        let tas = [];

        for (const assignmentSem of results.assignment_semesters) {
            let assignment = assignmentSem.assignment;
            assignments.push({
                assignment_id: assignmentSem.assignment_id,
                name: assignment.name,
                category: assignment.category,
                start_date: assignmentSem.start_date,
                end_date: assignmentSem.end_date,
            });
        }

        for (const semUser of results.semester_users) {
            let ta = await models.ta.finmodelsyPk(semUser.user_id);
            let account = semUser.account;
            tas.push({
                ta_id: ta.ta_id,
                fname: account.fname,
                lname: account.lname,
                email: account.email,
                isAdmin: ta.is_admin == 1
            });
        }

        let data = { 
            title: "15-122 Office Hours Queue | Settings",
            topics: assignments,
            tas: tas,
            adminSettings: adminSettings,
            isAuthenticated: req.user.isAuthenticated,
            isTA: req.user.isAuthenticated,
            isAdmin: req.user.isAuthenticated
        };
        respond(req, res, message, data, 200);
    }).catch(err => {
        message = err.message || "An error occurred while retrieving data";
        respond_error(req, res, message, 500);
    });
}

/** Get Function **/
exports.get = function (req, res) {
    // TODO: use req to get access token and check for user status
    get_response(req, res);
}

/** ADMIN FUNCTIONS **/
/** Config Settings **/
exports.post_update_semester = function (req, res) {
    // TODO: use req to get access token and check for user status

    var sem_id = req.body.sem_id;
    if (!sem_id || sem_id.length != 3) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    // If already at current semester, no need to change
    if (sem_id == adminSettings.currSem) {
        get_response(req, res);
        return;
    }

    models.semester.findOrCreate({ 
        where: { 
            sem_id: sem_id
        }
    }).then(function(results) {
        adminSettings.currSem = results[0].sem_id;
        get_response(req, res, `Current semester set to ${sem_id} successfully`);
    }).catch(err => {
        message = err.message || "An error occurred while updating current semester";
        respond_error(req, res, message, 500);
    });
}

exports.post_update_slack_url = function (req, res) {
    // TODO: use req to get access token and check for user status

    var slackURL = req.body.slackURL;
    if (!slackURL) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    if (adminSettings.slackURL == slackURL) return;

    adminSettings.slackURL = slackURL;
    slack.update_slack();
    respond(req, res, `Slack Webhook URL updated successfully`, {}, 200);
}

exports.post_update_questions_url = function (req, res) {
    // TODO: use req to get access token and check for user status

    var questionsURL = req.body.questionsURL;
    if (!questionsURL) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    if (adminSettings.questionsURL == questionsURL) return;

    adminSettings.questionsURL = questionsURL;
    respond(req, res, `Questions Guide URL updated successfully`, {}, 200);
}

exports.post_update_rejoin_time = function (req, res) {
    // TODO: use req to get access token and check for user status

    var rejoinTime = req.body.rejoinTime;
    if (!rejoinTime || isNaN(rejoinTime)) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    if (adminSettings.rejoinTime == rejoinTime) return;

    adminSettings.rejoinTime = rejoinTime;
    respond(req, res, `Rejoin time updated successfully to ${rejoinTime} minutes`, {}, 200);
}

/** Topics Functions **/
exports.post_create_topic = function (req, res) {
    // TODO: use req to get access token and check for user status

    var name = req.body.name;
    var category = req.body.category;
    var start_date = moment.tz(new Date(req.body.start_date), "America/New_York").toDate(); // TODO: get timezone (get from client? global config?)
    var end_date = moment.tz(new Date(req.body.end_date), "America/New_York").toDate();
    if (!start_date.getTime() || !end_date.getTime() || !name || !category) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    Promise.props({
        assignment: function() {
            return models.assignment.findOrCreate({ 
                where: { 
                    name: name,
                    category: category
                }
            });
        }(),
        semester: function() {
            return models.semester.findOrCreate({ 
                where: { 
                    sem_id: adminSettings.currSem
                }
            });
        }()
    }).then(function(results) {
        return models.assignment_semester.create({
            assignment_id: results.assignment[0].assignment_id,
            sem_id: results.semester[0].sem_id,
            start_date: start_date,
            end_date: end_date
        })
    }).then(function() {
        get_response(req, res, `Assignment ${name} created successfully`);
    }).catch(err => {
        message = err.message || "An error occurred while creating topic";
        respond_error(req, res, message, 500);
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
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    Promise.props({
        assignment_semester: function() {
            return models.assignment_semester.findOne({ 
                where: { 
                    assignment_id: assignment_id,
                    sem_id: adminSettings.currSem
                }
            })
        }(),
        assignment: function() {
            return models.assignment.findOne({ 
                where: { 
                    assignment_id: assignment_id
                }
            });
        }()
    }).then(function(results) {
        if (results.assignment_semester == null || results.assignment == null) {
            respond_error(req, res, "Invalid assignment id: topic not found", 400);
            return;
        }

        return Promise.props({
            assignment_semester: function() {
                return results.assignment_semester.update({
                    start_date: start_date,
                    end_date: end_date
                })
            }(),
            assignment: function() {
                return results.assignment.update({
                    name: name,
                    category: category
                });
            }()
        })
    }).then(function() {
        get_response(req, res, `Assignment ${name} updated successfully`);
    }).catch(err => {
        message = err.message || "An error occurred while updating topic";
        respond_error(req, res, message, 500);
    });
}

exports.post_delete_topic = function (req, res) {
    // TODO: use req to get access token and check for user status

    var assignment_id = req.body.assignment_id;
    if (!assignment_id) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    models.assignment.destroy({ 
        where: { 
            assignment_id: assignment_id
        }
    }).then(function() {
        get_response(req, res, `Assignment deleted successfully`);
    }).catch(err => {
        message = err.message || "An error occurred while deleting topic";
        respond_error(req, res, message, 500);
    });
}

/** TA Functions **/
exports.post_create_ta = function (req, res) {
    // TODO: use req to get access token and check for user status

    var name = req.body.name;
    var email = req.body.email;
    var isAdmin = req.body.isAdmin;
    if (!name || !email) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    let [fname, lname] = name.split(" ");

    Promise.props({
        account: function() {
            return models.account.findOrCreate({ 
                where: {
                    fname: fname,
                    lname: lname,
                    email: email
                }
            });
        }(),
        semester: function() {
            return models.semester.findOrCreate({ 
                where: { 
                    sem_id: adminSettings.currSem
                }
            });
        }()
    }).then(function(results) {
        return Promise.props({
            semester_user: function() {
                return models.semester_user.findOrCreate({
                    where: {
                        user_id: results.account[0].user_id,
                        sem_id: results.semester[0].sem_id
                    }
                });
            }(),
            ta: function() {
                return models.ta.findOrCreate({
                    where: {
                        ta_id: results.account[0].user_id,
                        is_admin: isAdmin ? 1 : 0
                    }
                });
            }()
        })
    }).then(function(results) {
        return results.semester_user[0].update({
            is_ta: 1
        });
        
    }).then(function() {
        get_response(req, res, `TA ${name} created successfully`);
    }).catch(err => {
        message = err.message || "An error occurred while creating topic";
        respond_error(req, res, message, 500);
    });
}

exports.post_update_ta = function (req, res) {
    // TODO: use req to get access token and check for user status
    // TODO: from a design perspective, should we allow them to modify email or first/last name? 
    // It doesn't really make sense to me; perhaps only isAdmin can be updated

    var user_id = req.body.user_id;
    var isAdmin = req.body.isAdmin;
    if (!user_id) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    Promise.props({
        semester_user: function() {
            // We grab this to verify the user exists for this semester
            return models.semester_user.findOne({ 
                where: { 
                    user_id: user_id,
                    sem_id: adminSettings.currSem
                }
            })
        }(),
        account: function() {
            // We grab this to verify the user has an account
            return models.account.findOne({ 
                where: { 
                    user_id: user_id
                }
            });
        }(),
        ta: function() {
            return models.ta.findOne({ 
                where: { 
                    ta_id: user_id
                }
            });
        }(),
    }).then(function(results) {
        if (results.semester_user == null || results.account == null || results.ta == null) {
            respond_error(req, res, "Invalid user id: TA not found", 400);
            return;
        }

        return Promise.props({
            ta: function() {
                return results.ta.update({
                    is_admin: isAdmin ? 1 : 0
                });
            }(),
            name: results.account.fname + " " + results.account.lname
        })
    }).then(function(results) {
        get_response(req, res, `TA ${results.name} updated successfully`);
    }).catch(err => {
        message = err.message || "An error occurred while updating TA";
        respond_error(req, res, message, 500);
    });
}

exports.post_delete_ta = function (req, res) {
    // TODO: use req to get access token and check for user status

    var user_id = req.body.user_id;
    if (!user_id) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    models.semester_user.findOne({
        where: {
            user_id: user_id
        }
    }).then(function(sem_user) {
        return sem_user.update({
            is_ta: 0
        });
    }).then(function() {
        get_response(req, res, `TA deleted successfully`);
    }).catch(err => {
        message = err.message || "An error occurred while deleting TA";
        respond_error(req, res, message, 500);
    });
}
