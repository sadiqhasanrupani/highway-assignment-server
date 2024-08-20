import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import { asyncHandler } from '../utils/async-handler';
import { errorNext } from '../utils/error-handler';
import { DecodedPayload, HttpError } from '../types';

export type AuthRequest = {
  id: number;
  otpVerification: boolean;
} & Request;

export const isVerifyAuth = asyncHandler(async (req: AuthRequest | Request, res: Response, next: NextFunction) => {
  const authToken = req.get('Authorization') as string;
  const unauthorizedStatus = 401;

  if (!authToken) {
    return errorNext({
      httpStatusCode: unauthorizedStatus,
      message: 'not authorized.',
      next,
    });
  }

  const token = authToken.split(' ')[1];

  if (token === 'undefined' || !token)
    return errorNext({
      httpStatusCode: unauthorizedStatus,
      message: 'not authenticated',
      next,
    });

  try {
    let decodeToken: DecodedPayload | JwtPayload | string;
    decodeToken = jwt.verify(token, process.env.SECRET_KEY as string);

    if (!decodeToken) {
      return errorNext({
        httpStatusCode: unauthorizedStatus,
        message: 'not authenticated',
        next,
      });
    }

    const decodedToken = decodeToken as DecodedPayload;

    if (decodedToken.otpVerification) {
      return errorNext({ httpStatusCode: 401, message: 'Current user is already verified.', next });
    }

    const authRequest = req as AuthRequest;
    authRequest.id = decodedToken.id;
  } catch (err) {
    const error: HttpError = new Error(
      'Authorization token is invalid or expired. Please log in to your account and try again.',
    );
    error.httpStatusCode = 401;
    next(error);
  }

  next();
});
