import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

// routes
import authRoute from "./routes/auth.router";
import verifyRoute from "./routes/verify.router";

import { HttpError } from "./types";

const app = express();
const port = parseInt((process.env.PORT as string) || "8080");
const baseUrl = "/api/v1";

app.use(express.json());
app.use(
  cors({
    origin: process.env.ORIGIN,
  }),
);
app.use(morgan("dev"));

// routes
app.use(`${baseUrl}/auth`, authRoute);
app.use(`${baseUrl}/verify`, verifyRoute);

// error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (err.isValidationErr) {
    return res
      .status(err.httpStatusCode || 422)
      .json({ message: err.message, errorStack: err.errorStack });
  }
  return res.status(err.httpStatusCode || 500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`[server]: server is listening on http://localhost:${port}`);
});
