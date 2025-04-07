const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/signup',
    [
        body('username').notEmpty(),
        body('fullname').notEmpty(),
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
        validate
    ],
    authController.register
);

router.post('/login',
    [
        body('email').isEmail(),
        body('password').notEmpty(),
        validate
    ],
    authController.login
);

router.post('/refresh', authController.refresh);

router.post('/logout', authController.logout);

module.exports = router;

