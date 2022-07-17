const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');

const http = require('http');
const cors = require("cors");

const app = express();

// Initializing other controllers
const slack = require('./controllers/slack');
const sockets = require('./controllers/sockets');
const settingsCtr = require('./controllers/settings');

// Routes
const home = require("./routes/home");
const settings = require("./routes/settings");
const metrics = require("./routes/metrics");

app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const models = require("./models");
const config = require("./config/config");

models.sequelize.authenticate().then(() => {
    console.log("Connected to the database!");
})
.catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
});

models.sequelize.sync().catch((err) => {
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

    if (access_token == config.OWNER_ACCESS_TOKEN) {
        req.user = {
            isAuthenticated: true,
            isTA: true,
            isAdmin: true,
            isOwner: true,
            andrewID: "Owner"
        };
        next();
        return;
    }
    
    models.account.findOne({
        where: {
            access_token: access_token
        },
        include: [
            { 
                model: models.semester_user,  
                where: {
                    sem_id: settingsCtr.get_admin_settings().currSem,
                }, 
                as: "semester_users" 
            },
            { model: models.student, as: "student" },
            { model: models.ta, as: "ta" },
        ]
    }).then(function(account) {
        let semester_user = account?.semester_users[0];
        let student = account?.student;
        let ta = account?.ta;

        if (account == null || semester_user == null || 
            (student == null && ta == null)) 
        {
            req.user = { isAuthenticated: false };
            next();
            return;
        }

        let isTA = semester_user.is_ta == 1;
        let isAdmin = ta?.is_admin == 1;
        let andrewID = account.email.split("@")[0];

        req.user = {
            account: account,
            sem_user: semester_user,
            student: student,
            ta: ta,
            isAuthenticated: true, 
            isTA: isTA,
            isAdmin: isAdmin,
            andrewID: andrewID
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

slack.init();
sockets.init(server);

server.listen(port, () => console.log(`Listening on port ${port}`));
module.exports = app;
