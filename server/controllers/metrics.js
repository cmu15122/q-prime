const Sequelize = require('sequelize');
const Promise = require("bluebird");

const models = require('../models');

/** Helper Functions **/
function respond_error(req, res, message, status) {
    res.status(status);
    res.json({ message: message });
}

exports.get = (req, res) => {
    res.status(200);

    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to view this page";
        respond_error(req, res, message, 404);
        return;
    }

    if (req.user.isOwner) {
        let data = { isOwner: req.user.isOwner };
        res.send(data);
        return;
    }

    res.send({ 
        title: "15-122 Office Hours Queue | Metrics",
        isAuthenticated: req.user.isAuthenticated,
        isTA: req.user.isTA,
        isAdmin: req.user.isAdmin,
        andrewID: req.user?.andrewID,
        preferred_name: req.user?.account?.preferred_name
    });
};

exports.get_helped_students = (req, res) => {
    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    let questions = [];
    models.question.findAll({
        where: {
            ta_id: req.user.ta.ta_id,
            help_time: {
                [Sequelize.Op.ne]: null
            }
        }
    }).then((questionModels) =>  {
        let accountReqs = [];

        for (const questionModel of questionModels) {
            let question = questionModel.dataValues;
            questions.push({
                student_name: "",
                student_andrew: "",
                start_date: question.help_time,
                end_date: question.exit_time,
            });

            accountReqs.push(models.account.findByPk(question.student_id));
        }

        return Promise.all(accountReqs);
    }).then((accounts) => {
        for (var i = 0; i < questions.length; i++) {
            let account = accounts[i].dataValues;
            if (account != null) {
                questions[i].student_name = account.preferred_name;
                questions[i].student_andrew = account.email.split("@")[0];
            }
        }

        res.status(200);
        res.json({ helpedStudents: questions });
    });
}

exports.get_num_questions_answered = (req, res) => {
    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    models.question.findAndCountAll({
        where: {
            ta_id: req.user.ta.ta_id,
            help_time: {
                [Sequelize.Op.ne]: null
            }
        }
    }).then(({count, rows}) =>  {
        res.status(200);
        res.json({ numQuestions: count });
    });
}

exports.get_avg_time_per_question = (req, res) => {
    if (!req.user || !req.user.isTA) {
        message = "You don't have permissions to perform this operation";
        respond_error(req, res, message, 403);
        return;
    }

    models.question.findAndCountAll({
        where: {
            ta_id: req.user.ta.ta_id,
            help_time: {
                [Sequelize.Op.ne]: null,
            }
        }
    }).then(({count, rows}) =>  {
        let averageTime = 0;

        for (const questionModel of rows) {
            let question = questionModel.dataValues;
            averageTime += (question.exit_time - question.help_time) / 1000 / 60;
        }

        if (count != 0) averageTime /= count;

        res.status(200);
        res.json({ averageTime: averageTime });
    });
}
