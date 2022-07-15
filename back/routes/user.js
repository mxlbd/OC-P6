const express = require('express');
const router = express.Router();

// Middleware
const password = require('../middleware/password-validator');

// Controlleur
const userCtrl = require('../controllers/user');

router.post('/signup', password, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
