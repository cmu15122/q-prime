const express = require('express');
const router = express.Router();

const home = require('../controllers/home');

router.get('/', home.get);
router.post('/freezeQueue', home.post_freeze_queue);
router.post('/unfreezeQueue', home.post_unfreeze_queue);

module.exports = router;
