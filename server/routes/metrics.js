const express = require('express');
const router = express.Router();

const metrics = require('../controllers/metrics');

router.get('/', metrics.get);

router.get('/helpedStudents', metrics.get_helped_students);
router.get('/numQuestionsAnswered', metrics.get_num_questions_answered);
router.get('/averageTimePerQuestion', metrics.get_avg_time_per_question);
router.get('/numQuestionsToday', metrics.get_num_questions_today);
router.get('/numBadQuestionsToday', metrics.get_num_bad_questions_today);
router.get('/avgWaitTimeToday', metrics.get_avg_wait_time_today);
router.get('/taStudentRatioToday', metrics.get_ta_student_ratio_today);
router.get('/totalNumQuestions', metrics.get_total_num_questions);
router.get('/totalAvgTimePerQuestion', metrics.get_total_avg_time_per_question);
router.get('/totalAvgWaitTime', metrics.get_total_avg_wait_time);

module.exports = router;
