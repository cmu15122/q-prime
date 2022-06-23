const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const Promise = require('bluebird');

const http = require('http');
const cors = require("cors");

const app = express();

// Initializing other controllers
const slack = require('./controllers/slack.js');

slack.init();

// Routes
const home = require("./routes/home.js");
const settings = require("./routes/settings.js");
const metrics = require("./routes/metrics.js");

app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const db = require("./database/models");
db.sequelize.authenticate().then(() => {
    console.log("Connected to the database!");
})
.catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
});

db.sequelize.sync().catch((err) => {
    console.log(err);
    process.exit();
});

app.use(function(req, res, next) {
    let access_token = req.headers['authorization'];
    if (!access_token) {
        req.user = { isAuthenticated: false };
        next();
        return;
    }
    
    db.account.findOne({
        where: {
            access_token: access_token
        }
    }).then(function(account) {
        return Promise.props({
            account: account,
            sem_user: function() {
                return db.semester_user.findOne({
                    where: {
                        user_id: account.user_id
                    }
                })
            }(),
            student: function() {
                return db.student.findOne({
                    where: {
                        student_id: account.user_id
                    }
                })
            }(),
            ta: function() {
                return db.ta.findOne({
                    where: {
                        ta_id: account.user_id
                    }
                })
            }()
        });
    }).then(function(results) {
        let isTA = results.sem_user?.is_ta == 1;
        let isAdmin = results.ta?.is_admin == 1;
        req.user = {
            account: results.account,
            sem_user: results.sem_user,
            student: results.student,
            ta: results.ta,
            isAuthenticated: true, 
            isTA: isTA,
            isAdmin: isAdmin
        };
        next();
    });
});

// Setting Routes
app.use('/', home);
app.use('/settings', settings);
app.use('/metrics', metrics)

const port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);

module.exports = app;
