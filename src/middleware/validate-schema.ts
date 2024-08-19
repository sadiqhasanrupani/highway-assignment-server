import express from "express";
import { ContextRunner } from "express-validator";
import { HttpError } from "../types/index";

// Validation middleware function
export const validate = (validations: ContextRunner[]) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        const error: HttpError = new Error("Validation Error");
        error.httpStatusCode = 422;
        error.errorStack = result.array() || [];
        error.isValidationErr = true;
        return next(error);
      }
    }
    next();
  };
};
