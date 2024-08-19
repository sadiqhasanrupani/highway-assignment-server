import { NextFunction } from "express";
import { ValidationError, Location } from "express-validator";
import { HttpError } from "../types";

type ErrorValidator = {
  httpStatusCode: number;
  errorStack: ValidationError[];
  isValidationErr?: boolean;
  next: NextFunction;
};

type ErrorNext = {
  next: NextFunction;
  httpStatusCode: number;
  message: string;
};

export function errorValidator(props: ErrorValidator) {
  const error: HttpError = new Error(props.errorStack[0].msg);
  error.isValidationErr = props.isValidationErr || true;
  error.httpStatusCode = 422;
  error.errorStack = props.errorStack;
  return props.next(error);
}

export function errorNext(props: ErrorNext) {
  const error: HttpError = new Error(props.message);
  error.httpStatusCode = props.httpStatusCode;

  return props.next(error);
}
