import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AuthRequest } from "../middleware/is-auth";

export const verifyTokenHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    return res.status(200).json({
      message: "token is verified",
      id: authReq.id,
    });
  },
);
