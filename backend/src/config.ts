import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3030,
  sessionSecret: process.env.SESSION_SECRET || "default-secret",
  isProduction: process.env.NODE_ENV === "production",
  allowedOrigins: [
    "http://localhost:5173",
  ],
  mongoUri: process.env.MONGO_URI,
};
