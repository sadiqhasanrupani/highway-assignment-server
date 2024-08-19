import { Request, Response, NextFunction } from "express";
import { HttpError } from "../types/index";
import { AuthRequest } from "../middleware/is-auth";

export function asyncHandler(
  handler: (req: Request | AuthRequest, res: Response, next: NextFunction) => Promise<Response | any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch((err: unknown) => {
      let error: HttpError;

      if (err instanceof Error) {
        error = new Error(err.message) as HttpError;
        error.httpStatusCode = (err as HttpError).httpStatusCode || 500;
      } else {
        error = new Error("Internal server error") as HttpError;
        error.httpStatusCode = 500;
      }

      next(error);
    });
  };
}
