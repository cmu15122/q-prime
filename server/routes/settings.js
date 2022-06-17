const express = require('express');
const router = express.Router();

const settings = require('../controllers/settings');

router.get('/', settings.get);
router.post('/topics/add', settings.post_add_topic);
router.post('/topics/edit', settings.post_edit_topic);
router.post('/topics/delete', settings.post_delete_topic);

module.exports = router;
