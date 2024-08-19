import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./src/schemas/schemas.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_QUERY as string,
  },
  verbose: true,
  strict: true,
});
