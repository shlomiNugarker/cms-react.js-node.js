import { User } from "../models/User";
import bcrypt from "bcrypt";

export const findAllUsers = async () => {
  return await User.find().select("-password");
};

export const findUserById = async (id: string) => {
  return await User.findById(id).select("-password");
};

export const updateUserById = async (id: string, updateData: object) => {
  return await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");
};

export const deleteUserById = async (id: string) => {
  return await User.findByIdAndDelete(id);
};

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  return await User.create({ name, email, password, role });
};

export const checkIfUserExists = async (email: string) => {
  return await User.findOne({ email });
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const updateUserPassword = async (id: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return await User.findByIdAndUpdate(
    id,
    { password: hashedPassword },
    { new: true }
  );
};

export const updateUserResetToken = async (
  id: string,
  resetToken: string,
  expires: Date
) => {
  return await User.findByIdAndUpdate(id, {
    resetPasswordToken: resetToken,
    resetPasswordExpires: expires,
  });
};
