const express = require('express');
const router = express.Router();

const settingsView = require('../controllers/settings');

router.get('/', settingsView);

module.exports = router;
