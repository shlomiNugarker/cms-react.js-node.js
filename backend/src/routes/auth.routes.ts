import { Router } from "express";
import {
  forgotPassword,
  resetPassword,
  getAuthenticatedUser,
  loginUser,
  registerUser,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", loginUser);

router.post("/register", registerUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/me", authMiddleware, getAuthenticatedUser);

export default router;
