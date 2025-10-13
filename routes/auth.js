const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

const {body} = require('express-validator');

const validateUser = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({min: 8}).withMessage('Password must be at least 8 characters long').
        isStrongPassword().withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('phone').isMobilePhone().withMessage('Please provide a valid phone number')

]

router.post('/login', authController.login);

router.post('/register', validateUser, authController.register);

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp' , authController.verifyPasswordResetOTP);
router.post('/reset-password', authController.verifyPasswordResetOTP);




module.exports = router;