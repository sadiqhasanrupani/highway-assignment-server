import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';

// middlewares
import { validate } from '../middleware/validate-schema';

// controller
import {
  loginHandler,
  registerHandler,
  resendOtpHandler,
  verifyOtpHandler,
  resetPassword,
} from '../controller/auth.controller';
import { ContactEnum, HttpError } from '../types';
import { isAuth } from '../middleware/is-auth';
import { AuthRequest, isVerifyAuth } from '../middleware/is-verify-otp';
import { db } from '../config/db.config';
import { users } from '../schemas/schemas';
import { eq } from 'drizzle-orm';

const router = Router();

let hashPassword = '';

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
    isVerifyAuth,
    validate([
      body('otpCode').notEmpty().isLength({ min: 6, max: 6 }).withMessage('OTP code must be exactly 6 digits long.'),
    ]),
  ],
  verifyOtpHandler,
);

// resend otp rotue
router.get('/resend-otp', [isVerifyAuth], resendOtpHandler);

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

router.patch('/reset-password', [
  isAuth,
  validate([
    body('currentPassword')
      .notEmpty()
      .isLength({ min: 5 })
      .custom(async (value, { req }) => {
        const authReq = req as AuthRequest;

        // check current password match with the given password
        const validUsers = await db
          .select({ hashPassword: users.password })
          .from(users)
          .where(eq(users.id, authReq.id));
        const validUser = validUsers[0];

        if (!validUser) {
          const error: HttpError = new Error('Unauthorized user');
          error.httpStatusCode = 422;
          throw error;
        }

        hashPassword = validUser.hashPassword;

        const isSamePassword = await bcrypt.compare(value, hashPassword);
        if (!isSamePassword) {
          const error: HttpError = new Error("The password doesn't match the current password.");
          error.httpStatusCode = 422;
          throw error;
        }

        return true;
      }),
    body('updatedPassword')
      .notEmpty()
      .isLength({ min: 5 })
      .custom(async (value) => {
        const isSamePassword = await bcrypt.compare(value, hashPassword);

        if (isSamePassword) {
          const error: HttpError = new Error('New password must be different from the current password');
          error.httpStatusCode = 422;
          throw error;
        }

        return true;
      }),
  ]),
  resetPassword,
]);

const authRoute = router;
export default authRoute;
