import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { AuthRequest } from '../middleware/is-auth';

import { db } from '../config/db.config';
import { users } from '../schemas/schemas';
import { eq, sql } from 'drizzle-orm';
import { errorNext } from '../utils/error-handler';

export const getUserDetail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;

  // check is valid or invalid

  const validUsers = await db
    .select({
      fullname: sql<string>`${users.first_name} || ' ' || ${users.last_name}`,
      email: users.email,
      id: users.id,
    })
    .from(users)
    .where(eq(users.id, authReq.id));
  const validUser = validUsers[0];

  if (!validUser) {
    return errorNext({ httpStatusCode: 401, message: 'Unable to get the current user credentials', next });
  }

  return res.status(200).json({
    message: 'User details got successfully',
    userDetail: validUser,
  });
});
