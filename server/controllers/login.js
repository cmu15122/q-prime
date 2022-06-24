require('dotenv').config() // TODO: move the process.env over to config.js

const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

const settings = require('./settings');
const models = require('../models');

const { OAuth2Client } = require('google-auth-library');

const config = require("../config/config.json");
const client = new OAuth2Client(config.google_client_id);

// TODO: replace with database

exports.post_login = async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.google_client_id,
    });

    const { name, email } = ticket.getPayload(); // TODO: get any other info we need

    const [fname, lname] = name.split(" ");

    models.account.findOrCreate({ 
        where: {
            email: email
        }
    }).then(function([account, created]) {
        if (created) {
            const access_token = jwt.sign(
                {
                    name: name,
                    email: email
                },
                process.env.TOKEN_KEY,
                {
                    algorithm: 'HS256'
                }
            );

            account.set({
                fname: fname,
                lname: lname,
                access_token: access_token
            });
        }

        // TODO: replace with grabbing TA information from database
        let isTA = email.split('@')[1] === 'andrew.cmu.edu';

        return Promise.props({
            account: account.save(),
            semUser: models.semester_user.findOrCreate({
                where: {
                    sem_id: settings.get_admin_settings().currSem,
                    user_id: account.user_id
                }
            }),
            ta: function() {
                if (isTA) {
                    return models.ta.findOrCreate({
                        where: {
                            ta_id: account.user_id
                        }
                    });
                }
                return [null, false];
            }(),
            student: function() {
                if (!isTA) {
                    return models.student.findOrCreate({
                        where: {
                            student_id: account.user_id
                        }
                    });
                }
                return [null, false];
            }(),
            isTA: isTA,
            isAdmin: isTA // TODO: change
        });
    }).then(function(results) {
        let [semUser, semUserCreated] = results.semUser;
        let account = results.account;
        let [ta, _] = results.ta;

        if (semUserCreated && results.isTA) {
            if (results.isTA) {
                semUser.set({
                    is_ta: 1
                });
            } else {
                semUser.set({
                    is_ta: 0
                });
            }

            if (results.isAdmin) {
                ta.set({
                    is_admin: 1
                });
            }
        }

        return Promise.props({
            semUser: semUser.save(),
            ta: function() {
                if (!ta) return null;
                return ta.save();
            }(),
            access_token: account.access_token
        });
    }).then(function(results) {
        res.status(201);
        res.json({ name: name, email: email, access_token: results.access_token });
    }).catch(function (err) {
        console.log(err);
    });
};

exports.post_logout = (req, res) => {
    tempmodels.setIsAuthenticated(false);
	tempmodels.setAccessToken("");
    res.status(200);
};
