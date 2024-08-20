import { Request, Response, NextFunction } from 'express';
import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// utils
import { asyncHandler } from '../utils/async-handler';
import { errorNext, errorValidator } from '../utils/error-handler';
import { isOtpDateIsExpired, storeOtp, updateOtp } from '../utils/otp';
import { mailSend } from '../utils/mail/send-mail.mail';

// db
import { db } from '../config/db.config';

// schemas
import { otps, users } from '../schemas/schemas';

// types
import { HttpError, LoginBody, RegisterBody, ResetPassBody, VerifyOtpBody } from '../types';
import { AuthRequest } from '../middleware/is-auth';

export const registerHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const registerBody: RegisterBody = req.body;

  // Check if email already exists
  const user = await db.select({ id: users.id }).from(users).where(eq(users.email, registerBody.email));
  if (user[0]) {
    errorValidator({
      errorStack: [
        {
          msg: 'email already exits',
          path: 'email',
          type: 'field',
          value: registerBody.email,
          location: 'body',
        },
      ],
      httpStatusCode: 422,
      next: next,
    });
  }

  const password = await bcrypt.hash(registerBody.password, 12);

  // Register the user
  const registerUser = await db.insert(users).values({
    email: registerBody.email,
    password: password,
    first_name: registerBody.firstName,
    last_name: registerBody.lastName,
    contactMode: registerBody.contactMode,
  });

  if (registerUser.rowCount === 0) {
    const error: HttpError = new Error('Unable to register the user.');
    error.httpStatusCode = 400;
    return next(error);
  }

  const userDetails = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, registerBody.email));

  if (!userDetails[0]) {
    return errorNext({
      httpStatusCode: 400,
      message: 'Unable to get the recent registered user',
      next,
    });
  }

  const generateOtp = await storeOtp(userDetails[0].id);

  try {
    await mailSend({
      to: userDetails[0].email,
      subject: 'Your OTP code from highway',
      htmlMessage: `
          <p>Your OTP code is ${generateOtp}</p>
        `,
    });
    console.log('Message sent');
  } catch (err: any) {
    let error: HttpError;

    if (err instanceof Error) {
      if (!(err as any).statusCode) {
        (err as any).statusCode = 500;
        error = new Error('Something went wrong') as HttpError;
        error.httpStatusCode = (err as HttpError).httpStatusCode || 500;
      }

      error = new Error(err.message) as HttpError;
      error.httpStatusCode = (err as HttpError).httpStatusCode || 500;
    } else {
      error = new Error('Internal server error') as HttpError;
      error.httpStatusCode = 500;
    }

    next(error);
  }

  const token = jwt.sign(
    {
      id: userDetails[0].id,
      otpVerification: false,
    },
    process.env.SECRET_KEY as string,
    {
      expiresIn: '24h',
    },
  );

  return res.status(200).json({
    message: 'OTP has been sent to your email. Please check and verify within 5 minutes, or the OTP will expire.',
    token,
  });
});

export const verifyOtpHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const verifyOtpBody: VerifyOtpBody = authReq.body;

  // check userId and otp number is valid
  const validOtps = await db
    .select({ id: otps.id, expiresAt: otps.expire_at })
    .from(otps)
    .where(and(eq(otps.user_id, authReq.id), eq(otps.otp_code, verifyOtpBody.otpCode)));

  const validOtp = validOtps[0];
  if (!validOtp) {
    return errorNext({
      httpStatusCode: 401,
      message: 'Invalid OTP, please try again',
      next,
    });
  }

  const isExpired = isOtpDateIsExpired(validOtp.expiresAt);

  if (isExpired) {
    return errorNext({
      httpStatusCode: 401,
      message: 'OTP has expired. Please request a new OTP and try again.',
      next,
    });
  }

  // now will delete the otp which is related with this current user
  const deleteOtps = await db.delete(otps).where(eq(otps.user_id, authReq.id));

  if (deleteOtps.rowCount === 0) {
    return errorNext({ httpStatusCode: 400, message: 'something went wrong while deleting the otp', next });
  }

  const token = jwt.sign(
    {
      id: authReq.id,
      otpVerification: true,
    },
    process.env.SECRET_KEY as string,
    {
      expiresIn: '24h',
    },
  );

  return res.status(200).json({ message: 'OTP verified successfully. You are now registered.', token });
});

export const resendOtpHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;

  // check otp is valid
  const validOtps = await db
    .select({ email: users.email, otpId: otps.id })
    .from(otps)
    .innerJoin(users, eq(users.id, otps.user_id))
    .where(and(eq(otps.user_id, authReq.id)));

  const validOtp = validOtps[0];

  if (!validOtp) {
    return errorNext({ httpStatusCode: 400, message: 'Unable to find otp data related to the current user.', next });
  }

  // updating otp
  const updatedOtp = await updateOtp(authReq.id, validOtp.otpId);

  // send update otp through mail
  try {
    await mailSend({
      to: validOtp.email,
      subject: 'Your Updated OTP code from highway',
      htmlMessage: `
          <p>Your OTP code is ${updatedOtp}</p>
        `,
    });
    console.log('Message sent');
  } catch (err: any) {
    let error: HttpError;

    if (err instanceof Error) {
      if (!(err as any).statusCode) {
        (err as any).statusCode = 500;
        error = new Error('Something went wrong') as HttpError;
        error.httpStatusCode = (err as HttpError).httpStatusCode || 500;
      }

      error = new Error(err.message) as HttpError;
      error.httpStatusCode = (err as HttpError).httpStatusCode || 500;
    } else {
      error = new Error('Internal server error') as HttpError;
      error.httpStatusCode = 500;
    }

    next(error);
  }

  const token = jwt.sign(
    {
      id: authReq.id,
      otpVerification: false,
    },
    process.env.SECRET_KEY as string,
    {
      expiresIn: '24h',
    },
  );

  return res.status(200).json({ message: 'OTP has been resent to your email. Please check and verify.', token });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const loginBody: LoginBody = req.body;

  // check if email already exists
  const userDetails = await db
    .select({
      id: users.id,
      password: users.password,
    })
    .from(users)
    .where(eq(users.email, loginBody.email));

  if (!userDetails[0]) {
    errorValidator({
      errorStack: [
        {
          msg: 'email is invalid',
          path: 'email',
          type: 'field',
          value: loginBody.email,
          location: 'body',
        },
      ],
      httpStatusCode: 422,
      next: next,
    });
  }

  const userDetail = userDetails[0];

  // check otp verification is valid or invalid.
  const getUserOtps = await db.select({ id: otps.id }).from(otps).where(eq(otps.user_id, userDetail.id));

  if (getUserOtps[0]) {
    return errorNext({ httpStatusCode: 401, message: 'User is not verified', next: next });
  }

  // after that comparing the password with fetch user detail
  const isPasswordMatch = await bcrypt.compare(loginBody.password, userDetails[0].password);

  if (!isPasswordMatch) {
    return errorValidator({
      errorStack: [
        {
          msg: 'password is invalid.',
          path: 'password',
          type: 'field',
          value: loginBody.password,
          location: 'body',
        },
      ],
      httpStatusCode: 422,
      next: next,
    });
  }

  // generating tokens
  const token = jwt.sign(
    {
      id: userDetails[0].id,
      otpVerification: true,
    },
    process.env.SECRET_KEY as string,
    {
      expiresIn: '24h',
    },
  );

  return res.status(200).json({ message: 'login done successfully.', token: token });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const resetPassBody: ResetPassBody = authReq.body;

  const hashedPass = await bcrypt.hash(resetPassBody.updatedPassword, 12);

  // update the current user's password with the new password
  const updateUsers = await db.update(users).set({ password: hashedPass }).where(eq(users.id, authReq.id));

  if (updateUsers.rowCount === 0) {
    return errorNext({ httpStatusCode: 400, message: 'Something went wrong while updating your password', next });
  }

  return res.status(200).json({ message: 'Your password is now updated successfully.' });
});
