const express = require('express');
const router = express.Router();

const home = require('../controllers/home');
const login = require('../controllers/login');

router.get('/', home.get);
router.get('/studentData', home.get_student_data);
router.get('/allStudents', home.get_all_students);
router.get('/userData', home.get_user_data);
router.post('/freezeQueue', home.post_freeze_queue);
router.post('/unfreezeQueue', home.post_unfreeze_queue);
router.post('/addQuestion', home.post_add_question);
router.post('/removeStudent', home.post_remove_student);
router.post('/helpStudent', home.post_help_student);
router.post('/unhelpStudent', home.post_unhelp_student);
router.post('/updateQuestion', home.post_update_question);
router.post('/taRequestUpdateQ', home.post_taRequestUpdateQ);
router.post('/messageStudent', home.post_message_student);
router.post('/dismissMessage', home.post_dismiss_message);
router.post('/approveCooldownOverride', home.post_approve_cooldown_override);

router.post('/announcements/create', home.post_create_announcement);
router.post('/announcements/update', home.post_update_announcement);
router.post('/announcements/delete', home.post_delete_announcement);

router.post('/login', login.post_login);
router.post('/logout', login.post_logout);

module.exports = router;
