"use strict";
// import { Request, Response } from "express";
// import {
//   findAllUsers,
//   updateUserById,
//   deleteUserById,
// } from "../services/user.service";
// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await findAllUsers();
//     res.json(users);
//   } catch (error) {
//     console.error("❌ Error in getAllUsers:", error);
//     res.status(500).json({ message: "Failed to fetch users" });
//   }
// };
// export const updateUserRole = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { role } = req.body;
//     if (!["trainee", "coach", "super_admin"].includes(role)) {
//       return res.status(400).json({ message: "Invalid role" });
//     }
//     const updatedUser = await updateUserById(id, { role });
//     if (!updatedUser)
//       return res.status(404).json({ message: "User not found" });
//     res.json({ message: "User role updated successfully", user: updatedUser });
//   } catch (error) {
//     console.error("❌ Error in updateUserRole:", error);
//     res.status(500).json({ message: "Failed to update role" });
//   }
// };
// export const deleteUser = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const deletedUser = await deleteUserById(id);
//     if (!deletedUser)
//       return res.status(404).json({ message: "User not found" });
//     res.json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("❌ Error in deleteUser:", error);
//     res.status(500).json({ message: "Failed to delete user" });
//   }
// };
