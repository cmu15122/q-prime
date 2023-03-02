const moment = require("moment-timezone");
const Promise = require("bluebird");
const models = require('../models');
const home = require("./home");
const sockets = require('./sockets')

// Helper function that takes in an array of questions and returns an array of TAs (model.account) that are helping those questions
function getTAsFromQuestions(questions) {
  let taRequests = [];

  for (let i = 0; i < questions.length; i++) {
    taRequests.push(models.account.findOne({
      where: {
        user_id: questions[i].taID
      }
    }));
  }

  return Promise.all(taRequests)
}

let interval;

// Start a recurring one-minute timer to check if any TAs need to be reminded
exports.init = function () {
  clearInterval(interval);

  // Set an interval to run every minute from the time the timer is started
  interval = setInterval(() => {
    let activeQuestions = home.getOHQ().getAllStudentData().filter(studentData => studentData.helpTime !== null)

    return Promise.props({
        activeQuestions: activeQuestions,
        activeTAs: getTAsFromQuestions(activeQuestions),
    }).then((result) => {
      // for each question, check if the helping TAs time since helpTime is greater than TA's setting

      // these question objects are from the OHQ, not the database
      let activeQuestions = result.activeQuestions;

      // these TA objects are model.account objects
      let activeTAs = result.activeTAs.map(ta => ta.dataValues);

      for (let i = 0; i < activeQuestions.length; i++) {
        let current = activeQuestions[i];
        let helpingTa = activeTAs.find(ta => ta.user_id === current.taID)
        let minutesDiff = moment.tz(new Date(), "America/New_York").diff(moment(current.helpTime), "minutes")

        // only send once
        if (minutesDiff == helpingTa.settings.remindTime && helpingTa.settings.remindNotifsEnabled) {
          sockets.remind(current.taAndrewID);
        }
      }
    })
  }, 1000 * 60);
}

// Stop the timer
exports.stop = function () {
  clearInterval(interval);
}
