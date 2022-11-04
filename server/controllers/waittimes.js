const home = require("./home");

let slack = require("./slack");
let config = require("../config/config");
var sockets = require("./sockets");

let last_updated = new Date(0);
const update_interval_secs = 30;

let last_pinged = null;
const ping_threshold_mins = 30;
const ping_interval_mins = 15;

const models = require("../models");
const { Sequelize } = require("../models");
const moment = require("moment-timezone");
const studentCheckPeriodMins = 30;

let waitTime = 0;

exports.init = function () {
  exports.update_wait_times();
  setInterval(function () {
    var prev_ping_time = new Date();
    prev_ping_time.setSeconds(prev_ping_time.getSeconds() - update_interval_secs);

    if (last_updated < prev_ping_time) {
      exports.update_wait_times();
      last_updated = new Date();
    }
  }, update_interval_secs * 1000);
};

exports.update_wait_times = function () {
  // check number of students helped in the last 30 minutes
  let now = moment.tz(new Date(), "America/New_York");

  models.question
    .findAll({
      where: {
        exit_time: {
          [Sequelize.Op.gte]: now
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
      let activeTAs = []

      // add questions from database
      for (let i = 0; i < questions.length; i++) {
        let current = questions[i]
        let secondsDiff = moment(current.exit_time).diff(moment(current.help_time), "seconds")
        totalHelpedSeconds += secondsDiff

        if (!activeTAs.includes(current.ta_id)) {
          activeTAs.push(current.ta_id);
        }
      }

      // add question from live queue
      let currentlyHelping = home.getOHQ().getAllStudentData().filter(studentData => studentData.helpTime !== null)
      for (let i = 0; i < currentlyHelping.length; i++) {
        let current = currentlyHelping[i]
        let secondsDiff = moment.tz(new Date(), "America/New_York").diff(moment(current.helpTime), "seconds")
        totalHelpedSeconds += secondsDiff

        if (!activeTAs.includes(current.taID)) {
          activeTAs.push(current.taID);
        }
      }

      // calculate total number of people helped in last 30 min
      let totalQuestions = questions.length + currentlyHelping.length
      let totalTAs = activeTAs.length

      if (totalQuestions != 0) {
        // calculate time per person helped
        const minsPerStudent = (totalHelpedSeconds / 60) / totalQuestions;

        const numUnhelped = home
          .getOHQ()
          .getAllStudentData()
          .filter((student) => student.status !== 0).length;

        waitTime = numUnhelped * minsPerStudent / totalTAs;

        if (waitTime > ping_threshold_mins && (last_pinged == null || now.diff(last_pinged, "seconds") >= ping_interval_mins * 60)) {
          slack.send_message(
            "<!channel> The wait time is " + waitTime + " minutes right now. More TAs might be needed. (<" + config.PROTOCOL + "://" + config.DOMAIN + "/|view»>)"
          );
          last_pinged = now;
        }

        sockets.waittimes(minsPerStudent, home.getOHQ().getAllStudentData().length, numUnhelped, totalTAs);
      }
    });
};

exports.get = function () {
  return waitTime;
};
