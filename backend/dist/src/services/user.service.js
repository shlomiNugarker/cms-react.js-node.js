"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserResetToken = exports.updateUserPassword = exports.findUserByEmail = exports.checkIfUserExists = exports.createUser = exports.deleteUserById = exports.updateUserById = exports.findUserById = exports.findAllUsers = void 0;
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const findAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.find().select("-password");
});
exports.findAllUsers = findAllUsers;
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findById(id).select("-password");
});
exports.findUserById = findUserById;
const updateUserById = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).select("-password");
});
exports.updateUserById = updateUserById;
const deleteUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findByIdAndDelete(id);
});
exports.deleteUserById = deleteUserById;
const createUser = (name, email, password, role) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.create({ name, email, password, role });
});
exports.createUser = createUser;
const checkIfUserExists = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findOne({ email });
});
exports.checkIfUserExists = checkIfUserExists;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findOne({ email });
});
exports.findUserByEmail = findUserByEmail;
const updateUserPassword = (id, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    return yield User_1.User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
});
exports.updateUserPassword = updateUserPassword;
const updateUserResetToken = (id, resetToken, expires) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.User.findByIdAndUpdate(id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expires,
    });
});
exports.updateUserResetToken = updateUserResetToken;
