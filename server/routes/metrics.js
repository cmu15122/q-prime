const express = require('express');
const router = express.Router();

const metricsView = require('../controllers/metrics');

router.get('/', metricsView);

module.exports = router;
