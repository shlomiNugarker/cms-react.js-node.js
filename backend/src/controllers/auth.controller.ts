import { Request, Response } from "express";
import { generateToken, verifyToken } from "../utils/jwt";
import {
  findUserByEmail,
  createUser,
  updateUserPassword,
  updateUserResetToken,
  findUserById,
} from "../services/user.service";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // @ts-ignore
    const token = generateToken(user._id.toString());
    const { password: _, ...safeUser } = user.toObject();
    res
      .status(200)
      .json({ message: "Login successful", token, user: safeUser });
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (await findUserByEmail(email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await createUser(name, email, password, "user");
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("❌ Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await updateUserResetToken(
      // @ts-ignore
      user._id.toString(),
      resetToken,
      new Date(Date.now() + 3600000)
    );

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
    });

    res.status(200).json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.error("❌ Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await findUserById((decoded as any).userId);

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    // @ts-ignore
    await updateUserPassword(user._id.toString(), newPassword);
    // @ts-ignore
    await updateUserResetToken(user._id.toString(), "", new Date(0));

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("❌ Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAuthenticatedUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await findUserById((decoded as any).userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("❌ Error in getAuthenticatedUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
