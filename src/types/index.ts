import { ValidationError } from 'express-validator';
import { contactMode, users } from '../schemas/schemas';

export type ContactEnum = (typeof contactMode.enumValues)[number];

export type User = typeof users.$inferSelect;

export type DayOfWeekEnum = 'monday' | 'tuesday' | 'wednesday' | 'friday' | 'thursday' | 'saturday' | 'sunday';

export interface HttpError extends Error {
  httpStatusCode?: number;
  errorStack?: ValidationError[];
  isValidationErr?: boolean;
}

export type Message = {
  to?: string;
  subject?: string;
  htmlMessage?: string;
  from?: string;
};

// jwt decoded payload
export type DecodedPayload = {
  id: number;
  otpVerification: boolean;
};

// body types
export type RegisterBody = {
  firstName: string;
  lastName: string;
  password: string;
  contactMode: ContactEnum;
  email: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type VerifyOtpBody = {
  otpCode: string;
};

export type ResetPassBody = {
  currentPassword: string;
  updatedPassword: string;
};
