const express = require('express');
const router = express.Router();

const homeView = require('../controllers/homeController');

router.get('/', homeView);

module.exports = router;
