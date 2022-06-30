const express = require('express');
const router = express.Router();

const home = require('../controllers/home');
const login = require('../controllers/login');

router.get('/', home.get);
router.post('/freezeQueue', home.post_freeze_queue);
router.post('/unfreezeQueue', home.post_unfreeze_queue);
router.post('/addQuestion', home.post_add_question)

router.post('/login', login.post_login);
router.post('/logout', login.post_logout);


module.exports = router;
