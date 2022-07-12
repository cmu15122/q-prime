const express = require('express');
const router = express.Router();

const settings = require('../controllers/settings');

router.get('/', settings.get);
router.post('/videoChat/update', settings.post_update_video_chat);
router.post('/notifs/update', settings.post_update_notifs);
router.post('/topics/create', settings.post_create_topic);
router.post('/topics/update', settings.post_update_topic);
router.post('/topics/delete', settings.post_delete_topic);
router.post('/tas/create', settings.post_create_ta);
router.post('/tas/update', settings.post_update_ta);
router.post('/tas/delete', settings.post_delete_ta);
router.post('/config/sem/update', settings.post_update_semester);
router.post('/config/slack/update', settings.post_update_slack_url);
router.post('/config/questions/update', settings.post_update_questions_url);
router.post('/config/rejoin/update', settings.post_update_rejoin_time);

module.exports = router;
