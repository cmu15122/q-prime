const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const http = require('http');
const cors = require("cors");

const app = express();

// Initializing other controllers
const slack = require('./controllers/slack');
const sockets = require('./controllers/sockets');

// Routes
const home = require("./routes/home");
const settings = require("./routes/settings");
const metrics = require("./routes/metrics");

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

slack.init();
sockets.init(server);

server.listen(port, () => console.log(`Listening on port ${port}`));

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

module.exports = app;
