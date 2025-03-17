import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken, verifyToken } from "../utils/jwt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { config } from "../config";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    const token = generateToken((user._id as any).toString());
    const { password: _, ...safeUser } = user.toObject();
    
    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.isProduction, // Use secure in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    
    res
      .status(200)
      .json({ message: "Login successful", user: safeUser });
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: "user"
    });
    
    const { password: _, ...safeUser } = newUser.toObject();
    res
      .status(201)
      .json({ message: "User registered successfully", user: safeUser });
  } catch (error) {
    console.error("❌ Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    
    await User.updateOne(
      { _id: user._id as any },
      {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000)
      }
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
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    user.password = newPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = new Date(0);
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("❌ Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: config.isProduction,
      sameSite: "strict",
    });
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Error in logoutUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAuthenticatedUser = async (req: Request, res: Response) => {
  try {
    // Get the user from the request (set by authMiddleware)
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("❌ Error in getAuthenticatedUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
