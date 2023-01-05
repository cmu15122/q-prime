const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

const settings = require('./settings');
const models = require('../models');

const { OAuth2Client } = require('google-auth-library');

const config = require("../config/config.js");
const client = new OAuth2Client(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_REDIRECT_URI
);

exports.post_login = async (req, res) => {
    const { codeResponse } = req.body;
    const code = codeResponse.code;

    if (code == null) {
        res.status(400);
        res.json({ message: "Failed to log in" });
        return;
    }

    let adminSettings;
    client.getToken(code).then((response) => {
        let id_token = response.tokens.id_token;
        if (id_token == null) {
            throw new Error({ message: "Invalid login token" });
        }

        return client.verifyIdToken({
            idToken: id_token,
            audience: config.GOOGLE_CLIENT_ID,
        });
    }).then((ticket) => {
        if (ticket == null) {
            throw new Error({ message: "Invalid authentication occurred" });
        }

        adminSettings = settings.get_admin_settings();

        const { name, email } = ticket.getPayload();
        if (email == config.OWNER_EMAIL) {
            const access_token = jwt.sign(
                { name: name, email: email },
                config.TOKEN_KEY,
                { algorithm: 'HS256' }
            );
            config.OWNER_ACCESS_TOKEN = access_token;

            res.status(201);
            res.json({ name: name, email: email, access_token: access_token });
            return;
        } else if (adminSettings.currSem == null) {
            res.status(500);
            res.json({ message: "Queue has not been initialized; must log in with owner email" });
            return;
        }

        Promise.props({
            semester: models.semester.findByPk(adminSettings.currSem),
        }).then((result) => {
            if (result.semester == null) {
                res.status(500);
                res.json({ message: "Queue has not been initialized; must log in with owner email" });
                return;
            }

            Promise.props({
                account: models.account.findOrCreate({
                    where: { email: email }
                }),
                name: name
            }).then((res) => {
                let name = res.name;
                let [account, created] = res.account;

                if (created || !account.access_token) {
                    const access_token = jwt.sign(
                        {
                            name: name,
                            email: email
                        },
                        config.TOKEN_KEY,
                        { algorithm: 'HS256' }
                    );

                    account.set({
                        name: name,
                        preferred_name: name,
                        access_token: access_token
                    });
                }

                return Promise.props({
                    account: account.save(),
                    semUser: models.semester_user.findOrCreate({
                        where: {
                            sem_id: adminSettings.currSem,
                            user_id: account.user_id
                        }
                    })
                });
            }).then(function(results) {
                let account = results.account;
                let [semUser, semUserCreated] = results.semUser;

                if (semUserCreated || (semUser.isTA != 1)) {
                    return Promise.props({
                        account: account,
                        student: function() {
                            return models.student.findOrCreate({
                                where: {
                                    student_id: account.user_id
                                }
                            });
                        }(),
                    });
                }

                return Promise.props({
                    account: account,
                    ta: function() {
                        return models.ta.findByPk(account.user_id);
                    }(),
                });
            }).then(function(results) {
                let account = results.account;
                res.status(201);
                res.json({ name: account.name, email: account.email, access_token: account.access_token });
            }).catch(function(err) {
                console.log(err);
                res.status(500);
                res.json({ message: err.message });
            });
        }).catch(function(err) {
            console.log(err);
            res.status(500);
            res.json({ message: err.message });
        });
    }).catch(function(err) {
        console.log(err);
        res.status(500);
        res.json({ message: err.message });
    });
};
