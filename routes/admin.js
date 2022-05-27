const express = require('express');
const router = express.Router();

const adminView = require('../controllers/adminController');

router.get('/', adminView);

module.exports = router;
