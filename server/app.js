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
const settings = require("./routes/settings.js");
const metrics = require("./routes/metrics.js");

app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setting Routes
app.use('/', home);
app.use('/settings', settings);
app.use('/metrics', metrics)

const port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);

const models = require("./models");
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

module.exports = app;
