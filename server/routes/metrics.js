const express = require('express');
const router = express.Router();

const metrics = require('../controllers/metrics');

router.get('/', metrics.get);

router.get('/helpedStudents', metrics.get_helped_students);
router.get('/numQuestionsAnswered', metrics.get_num_questions_answered);
router.get('/averageTimePerQuestion', metrics.get_avg_time_per_question);

module.exports = router;
