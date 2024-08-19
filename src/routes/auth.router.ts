import { Router } from 'express';
import { body } from 'express-validator';

// middlewares
import { validate } from '../middleware/validate-schema';

// controller
import { loginHandler, registerHandler, resendOtpHandler, verifyOtpHandler } from '../controller/auth';
import { ContactEnum } from '../types';
import { isAuth } from '../middleware/is-auth';

const router = Router();

router.post(
  '/register',
  validate([
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('password')
      .notEmpty()
      .withMessage('password is empty')
      .isLength({ min: 5 })
      .withMessage('password should contain at-least 5 characters'),
    body('contactMode')
      .notEmpty()
      .withMessage('contact mode is not valid')
      .custom((value: ContactEnum) => {
        if (value !== 'email') {
          throw new Error('contact mode is not valid.');
        }
        return true;
      }),
    body('email').notEmpty().isEmail(),
  ]),
  registerHandler,
);

// verify otp route
router.post(
  '/verify-otp',
  [
    isAuth,
    validate([
      body('otpCode').notEmpty().isLength({ min: 6, max: 6 }).withMessage('OTP code must be exactly 6 digits long.'),
    ]),
  ],
  verifyOtpHandler,
);

// resend otp rotue
router.get('/resend-otp', [isAuth], resendOtpHandler);

router.post(
  '/login',
  validate([
    body('email').notEmpty().isEmail().withMessage('email is invalid'),
    body('password')
      .notEmpty()
      .withMessage('password is empty')
      .isLength({ min: 5 })
      .withMessage('password should contain at-least 5 characters'),
  ]),
  loginHandler,
);

const authRoute = router;
export default authRoute;
