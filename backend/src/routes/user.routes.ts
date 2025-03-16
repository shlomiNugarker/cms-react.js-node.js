import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import {
  getProfile,
  updateProfile,
  deleteUser,
  getAllUsers,
  updateUserRole,
} from "../controllers/user.controller";

const router = Router();

router.get("/profile", authMiddleware, getProfile);

router.patch("/profile", authMiddleware, updateProfile);

router.delete("/:id", authMiddleware, deleteUser);

router.get("/all", authMiddleware, roleMiddleware(["admin"]), getAllUsers);

router.put(
  "/:id/role",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateUserRole
);

export default router;
