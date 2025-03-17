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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatedUser = exports.logoutUser = exports.resetPassword = exports.forgotPassword = exports.registerUser = exports.loginUser = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user || !(yield user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = (0, jwt_1.generateToken)(user._id.toString());
        const _a = user.toObject(), { password: _ } = _a, safeUser = __rest(_a, ["password"]);
        // Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: config_1.config.isProduction,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });
        res
            .status(200)
            .json({ message: "Login successful", user: safeUser });
    }
    catch (error) {
        console.error("❌ Error in loginUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.loginUser = loginUser;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (yield User_1.User.findOne({ email })) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = yield User_1.User.create({
            name,
            email,
            password,
            role: "user"
        });
        const _b = newUser.toObject(), { password: _ } = _b, safeUser = __rest(_b, ["password"]);
        res
            .status(201)
            .json({ message: "User registered successfully", user: safeUser });
    }
    catch (error) {
        console.error("❌ Error in registerUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.registerUser = registerUser;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        yield User_1.User.updateOne({ _id: user._id }, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: new Date(Date.now() + 3600000)
        });
        const transporter = nodemailer_1.default.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        yield transporter.sendMail({
            to: user.email,
            subject: "Password Reset Request",
            text: `Click the link to reset your password: ${resetLink}`,
        });
        res.status(200).json({ message: "Reset link sent to your email" });
    }
    catch (error) {
        console.error("❌ Error in forgotPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const user = yield User_1.User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        user.password = newPassword;
        user.resetPasswordToken = "";
        user.resetPasswordExpires = new Date(0);
        yield user.save();
        res.status(200).json({ message: "Password has been reset successfully" });
    }
    catch (error) {
        console.error("❌ Error in resetPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.resetPassword = resetPassword;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: config_1.config.isProduction,
            sameSite: "strict",
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("❌ Error in logoutUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.logoutUser = logoutUser;
const getAuthenticatedUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user from the request (set by authMiddleware)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("❌ Error in getAuthenticatedUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAuthenticatedUser = getAuthenticatedUser;
