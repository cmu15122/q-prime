const home = require("./home");

let slack = require("./slack");
var sockets = require("./sockets");

let last_updated = new Date(0);
const ping_interval_secs = 5;
const ping_threshold_mins = 30;

const models = require("../models");
const { Sequelize } = require("../models");
const moment = require("moment-timezone");
const { OHQueue } = require("./queue");
const studentCheckPeriodMins = 30;

let waitTime = 0;

exports.init = function () {
  exports.update_wait_times();
  setInterval(function () {
    var prev_ping_time = new Date();
    prev_ping_time.setSeconds(prev_ping_time.getSeconds() - ping_interval_secs);

    if (last_updated < prev_ping_time) {
      exports.update_wait_times();
      last_updated = new Date();
    }
  }, ping_interval_secs * 1000);
};

exports.update_wait_times = function () {
  // check number of students helped in the last 30 minutes
  models.question
    .findAll({
      where: {
        exit_time: {
          [Sequelize.Op.gte]: moment
            .tz(new Date(), "America/New_York")
            .subtract(studentCheckPeriodMins, "minutes")
            .toDate(),
        },
        help_time: {
          [Sequelize.Op.ne]: null,
        },
      },
    })
    .then((questions) => {
      let totalHelpedSeconds = 0

      // add questions from database
      for (let i = 0; i < questions.length; i++) {
        let current = questions[i]
        let secondsDiff = moment(current.exit_time).diff(moment(current.help_time), "seconds")
        totalHelpedSeconds += secondsDiff
      }

      // add question from live queue
      let currentlyHelping = home.getOHQ().getAllStudentData().filter(studentData => studentData.helpTime !== null)
      for (let i = 0; i < currentlyHelping.length; i++) {
        let current = currentlyHelping[i]
        let secondsDiff = moment.tz(new Date(), "America/New_York").diff(moment(current.helpTime), "seconds")
        totalHelpedSeconds += secondsDiff
      }

      // calculate total number of people helped in last 30 min
      let totalQuestions = questions.length + currentlyHelping.length

      if (totalQuestions != 0) {
        // calculate time per person helped
        const minsPerStudent = Math.floor((totalHelpedSeconds / 60) / totalQuestions);

        const numUnhelped = home
          .getOHQ()
          .getAllStudentData()
          .filter((student) => student.status !== 0).length;

        waitTime = numUnhelped * minsPerStudent;

        if (waitTime > ping_threshold_mins) {
          slack.send_message(
            "<!channel> Help! Honk is on fire! Save him! :everythingsfineparrot:"
          );
        }


        sockets.waittimes(minsPerStudent, home.getOHQ().getAllStudentData().length, numUnhelped);
      }
    });
};

exports.get = function () {
  return waitTime;
};
