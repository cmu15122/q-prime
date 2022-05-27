const express = require('express');
const router = express.Router();

const settingsView = require('../controllers/settingsController');

router.get('/', settingsView);

module.exports = router;
