import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Try to get token from cookies first
  let token = req.cookies?.token;
  
  // If no token in cookies, check Authorization header
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, no token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized, invalid token" });
  }

  // @ts-ignore
  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  req.user = user;
  next();
};
