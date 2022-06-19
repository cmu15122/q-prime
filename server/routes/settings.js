const express = require('express');
const router = express.Router();

const settings = require('../controllers/settings');

router.get('/', settings.get);
router.post('/topics/create', settings.post_create_topic);
router.post('/topics/update', settings.post_update_topic);
router.post('/topics/delete', settings.post_delete_topic);
router.post('/tas/create', settings.post_create_ta);
router.post('/tas/update', settings.post_update_ta);
router.post('/tas/delete', settings.post_delete_ta);

module.exports = router;
