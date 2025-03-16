"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3030,
    sessionSecret: process.env.SESSION_SECRET || "default-secret",
    isProduction: process.env.NODE_ENV === "production",
    allowedOrigins: [
        // "http://127.0.0.1:3000",
        // "http://localhost:3000",
        "http://localhost:5173",
    ],
    mongoUri: process.env.MONGO_URI,
};
