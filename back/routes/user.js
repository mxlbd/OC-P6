const express = require('express');
const router = express.Router();

// Middleware
const password = require('../middleware/password-validator');
const email = require('../middleware/email-validator');

// Controlleur
const { signup, login } = require('../controllers/user');

router.post('/signup', email, password, signup);
router.post('/login', login);

module.exports = router;
