const home = require("./home");

let slack = require("./slack");
let config = require("../config/config");
var sockets = require("./sockets");

let last_pinged = null;
const ping_threshold_mins = 30;
const ping_interval_mins = 15;

let minute_ago_waittime = null;
let minute_ago_time = null;

const models = require("../models");
const { Sequelize } = require("../models");
const moment = require("moment-timezone");
const { OHQueue } = require("./queue");

const studentCheckPeriodMins = 30;

exports.wait_time_data = function () {
  // check number of students helped in the last 30 minutes
  let now = moment.tz(new Date(), "America/New_York");

  return models.question
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
      let numTAs = activeTAs.length

      if (totalQuestions != 0) {
        // calculate time per person helped
        const minsPerStudent = (totalHelpedSeconds / 60) / totalQuestions;

        const numUnhelped = home
          .getOHQ()
          .getAllStudentData()
          .filter((student) => student.status !== 0).length;

        const waitTime = numUnhelped * minsPerStudent / numTAs;

        if (minute_ago_time == null) {
          minute_ago_time = now;
          minute_ago_waittime = waitTime;
        }
        else {
          if (last_pinged == null || now.diff(last_pinged, "seconds") >= ping_interval_mins * 60) {
            if (waitTime > ping_threshold_mins && minute_ago_waittime > ping_threshold_mins) {
              slack.send_message(
                "<!channel> The wait time is " + (Math.round(waitTime)) + " minutes right now. More TAs might be needed. (<" + config.PROTOCOL + "://" + config.DOMAIN + "/|view»>)"
                );
              last_pinged = now;
            }
          }

          if (now.diff(minute_ago_time, "minutes") >= 1) {
            minute_ago_time = now;
            minute_ago_waittime = waitTime;
          }
        }

        return {
          minsPerStudent: minsPerStudent,
          numUnhelped: numUnhelped,
          numTAs: numTAs,
        }
      } else {
        return {
          minsPerStudent: 0,
          numUnhelped: 0,
          numTAs: 0,
        }
      }
    });
};

exports.get = function () {
  return waitTime;
};
