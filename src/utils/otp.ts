import moment from 'moment';

import { db } from '../config/db.config';
import { otps } from '../schemas/schemas';
import { and, eq } from 'drizzle-orm';

export function generateOtp() {
  return {
    otpCode: Math.floor(100000 + Math.random() * 900000).toString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  };
}

export async function storeOtp(userId: number) {
  const { expiresAt, otpCode } = generateOtp();

  await db.insert(otps).values({
    user_id: userId,
    otp_code: otpCode,
    expire_at: moment(expiresAt).toDate(),
  });

  return otpCode;
}

export async function updateOtp(userId: number, otpId: number) {
  const { expiresAt, otpCode: newOtpCode } = generateOtp();

  await db
    .update(otps)
    .set({ otp_code: newOtpCode, expire_at: expiresAt, updated_at: new Date() })
    .where(and(eq(otps.user_id, userId), eq(otps.id, otpId)));

  return newOtpCode;
}

export function isOtpDateIsExpired(dateTime: Date): boolean {
  const currentDate = moment();
  const expirationDatetime = moment(dateTime);

  // check currentDate is greater then dateTime
  const isExpired = currentDate.isAfter(expirationDatetime);

  return isExpired;
}
