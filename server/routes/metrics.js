const express = require('express');
const router = express.Router();

const metricsView = require('../controllers/metricsController');

router.get('/metrics', metricsView);

module.exports = router;
