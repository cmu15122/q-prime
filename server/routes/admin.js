const express = require('express');
const router = express.Router();

const adminView = require('../controllers/admin');

router.get('/', adminView);

module.exports = router;
