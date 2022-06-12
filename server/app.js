const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const http = require('http');
const cors = require("cors");

const app = express();

// Initializing other controllers
const slack = require('./controllers/slack.js');

slack.init();

// Routes
const home = require("./routes/home.js");
const admin = require("./routes/admin.js");
const settings = require("./routes/settings.js");
const metrics = require("./routes/metrics.js");

app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setting Routes
app.use('/', home);
app.use('/admin', admin);
app.use('/settings', settings);
app.use('/metrics', metrics)

const port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);

module.exports = app;
