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
        message = "You don't have permissions to view this page";
        respond_error(req, res, message, 404);
        return;
    }

    // Grab TA settings
    let settings = req.user.account?.settings;
    if (!settings) {
        settings = {};
    }
    settings["videoChatURL"] = req.user.ta?.zoom_url;

    if (!req.user.isAdmin) {
        let data = { 
            title: "15-122 Office Hours Queue | Settings",
            settings: settings,
            isAuthenticated: req.user.isAuthenticated,
            isTA: req.user.isTA,
            isAdmin: req.user.isAdmin,
            isOwner: req.user.isOwner,
            andrewID: req.user.andrewID
        };
        respond(req, res, message, data, 200);
    }

    // TODO: there's no need to fetch everything for non-admin TAs
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
                include: [
                    { 
                        model: models.account, 
                        include: [{model: models.ta, as: "ta"}] 
                    }
                ],
            })
        }()
    }).then(function(results) {
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
            let account = semUser.account;
            let ta = account.ta;
            tas.push({
                ta_id: ta.ta_id,
                name: account.name,
                preferred_name: account.preferred_name,
                email: account.email,
                isAdmin: ta.is_admin == 1
            });
        }

        let data = { 
            title: "15-122 Office Hours Queue | Settings",
            topics: assignments,
            tas: tas,
            adminSettings: adminSettings,
            settings: settings,
            isAuthenticated: req.user.isAuthenticated,
            isTA: req.user.isTA,
            isAdmin: req.user.isAdmin,
            isOwner: req.user.isOwner,
            andrewID: req.user.andrewID
        };
        respond(req, res, message, data, 200);
    }).catch(err => {
        console.log(err);
        message = err.message || "An error occurred while retrieving data";
        respond_error(req, res, message, 500);
    });
}

/** Get Function **/
exports.get = function (req, res) {
    get_response(req, res);
}

/** General Settings **/
exports.post_update_video_chat = function (req, res) {
    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    var enabled = req.body.enabled;
    var url = req.body.url;

    let account = req.user.account;
    let ta = req.user.ta;
    let settings = {};
    if (account.settings) {
        settings = account.settings;
    }

    let urlChanged = ta.zoom_url != url;

    settings["videoChatEnabled"] = enabled;
    account.settings = settings;
    account.changed("settings", true); // JSON fields need to be explictly marked as changed
    ta.zoom_url = url;

    Promise.props({
        ta: ta.save(),
        account: account.save()
    }).then(function(results) {
        req.user.account = results.account;
        req.user.ta = results.ta;
        get_response(req, res, urlChanged ? `Settings updated successfully` : "");
    }).catch(err => {
        console.log(err);
        message = err.message || "An error occurred while updating settings";
        respond_error(req, res, message, 500);
    });
}

exports.post_update_notifs = function (req, res) {
    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    var joinEnabled = req.body.joinEnabled;
    var remindEnabled = req.body.remindEnabled;
    var remindTime = req.body.remindTime;

    if (remindTime < 0) {
        // Do nothing if remind time is invalid
        get_response(req, res);
        return;
    }

    let account = req.user.account;
    let settings = {};
    if (account.settings) {
        settings = account.settings;
    }

    settings["joinNotifsEnabled"] = joinEnabled;
    settings["remindNotifsEnabled"] = remindEnabled;
    settings["remindTime"] = remindTime;
    account.settings = settings;
    account.changed("settings", true); // JSON fields need to be explictly marked as changed

    Promise.props({
        account: account.save()
    }).then(function(results) {
        req.user.account = results.account;
        get_response(req, res);
    }).catch(err => {
        console.log(err);
        message = err.message || "An error occurred while updating settings";
        respond_error(req, res, message, 500);
    });
}

/** ADMIN FUNCTIONS **/
/** Config Settings **/
exports.post_update_semester = function (req, res) {
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

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
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

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
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

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
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

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
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

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
        }()
    }).then(function(results) {
        return models.assignment_semester.create({
            assignment_id: results.assignment[0].assignment_id,
            sem_id: adminSettings.currSem,
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
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

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
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

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
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    var name = req.body.name;
    var email = req.body.email;
    var isAdmin = req.body.isAdmin;
    if (!name || !email) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    models.account.findOrCreate({ 
        where: {
            email: email
        }
    }).then(function([account, accountCreated]) {
        return Promise.props({
            account: function() {
                if (accountCreated) {
                    account.set({
                        name: name
                    });
                }
                return account.save();
            }(),
            semester_user: function() {
                return models.semester_user.findOrCreate({
                    where: {
                        user_id: account.user_id,
                        sem_id: adminSettings.currSem
                    }
                });
            }(),
            ta: function() {
                return models.ta.findOrCreate({
                    where: {
                        ta_id: account.user_id,
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
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

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
            name: results.account.name
        })
    }).then(function(results) {
        get_response(req, res, `TA ${results.name} updated successfully`);
    }).catch(err => {
        message = err.message || "An error occurred while updating TA";
        respond_error(req, res, message, 500);
    });
}

exports.post_delete_ta = function (req, res) {
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

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

/* BEGIN LOCATIONS */
let dayDictionary = {}
exports.post_update_locations = function(req, res) {
    console.log(req.user)
    if (!req.user || !req.user.isAdmin) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    var room = req.body.room;
    var days = req.body.days;
    var daysOfWeek = req.body.daysOfWeek;
    if (!room || !days) {
        respond_error(req, res, "Invalid/missing parameters in request", 400);
        return;
    }

    var newDayDictionary = dayDictionary
    for (var dayIdx in daysOfWeek) {
        let day = daysOfWeek[dayIdx]
        if (days.includes(day)) {
            // day is selected for room
            // check to see if room already appears for that day in dayDictionary
            let currRoomForDay = newDayDictionary[day]
            if (!currRoomForDay) {
                // no rooms for this day yet
                newDayDictionary[day] = [room]
            } else if (currRoomForDay && !currRoomForDay.includes(room)) {
                currRoomForDay.push(room)
                newDayDictionary[day] = currRoomForDay
            }
        } else {
            // day is NOT selected for room
            // make sure that it room doesn't appear for that day
            let currRoomForDay = newDayDictionary[day]
            if (currRoomForDay && currRoomForDay.includes(room)) {
                currRoomForDay.splice(currRoomForDay.indexOf(room), 1)
                newDayDictionary[day] = currRoomForDay
            }
        }
    }
    dayDictionary = newDayDictionary

    respond(req, res, `New location day created successfully`, { dayDictionary: dayDictionary }, 200);
}
