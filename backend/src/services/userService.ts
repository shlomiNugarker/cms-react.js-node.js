import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserService {
  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });

    return this.sanitizeUser(user);
  }

  static async loginUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  static async updateUser(userId: string, updateData: {
    name?: string;
    email?: string;
    role?: string;
  }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        throw new AppError('Email already exists', 400);
      }
    }

    Object.assign(user, updateData);
    await user.save();

    return this.sanitizeUser(user);
  }

  static async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { message: 'User deleted successfully' };
  }

  private static sanitizeUser(user: any) {
    const sanitized = user.toObject();
    delete sanitized.password;
    return sanitized;
  }

  private static generateToken(user: any) {
    return jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }
} 