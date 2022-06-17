const express = require('express');
const router = express.Router();

const settings = require('../controllers/settings');

router.get('/', settings.get);
router.post('/topics/add', settings.post_add_topic);

module.exports = router;
