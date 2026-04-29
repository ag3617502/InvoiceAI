const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../validations/auth.validation');
const auth = require('../middleware/auth');

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth, authController.me);
router.get('/verify-email/:token', authController.verifyEmail);
router.patch('/onboarding', auth, authController.updateOnboarding);
router.put('/profile', auth, authController.updateProfile);
router.put('/password', auth, authController.updatePassword);

module.exports = router;
