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
exports.getAuthenticatedUser = exports.resetPassword = exports.forgotPassword = exports.registerUser = exports.loginUser = void 0;
const jwt_1 = require("../utils/jwt");
const user_service_1 = require("../services/user.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield (0, user_service_1.findUserByEmail)(email);
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // @ts-ignore
        const token = (0, jwt_1.generateToken)(user._id.toString());
        const _a = user.toObject(), { password: _ } = _a, safeUser = __rest(_a, ["password"]);
        res
            .status(200)
            .json({ message: "Login successful", token, user: safeUser });
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
        if (yield (0, user_service_1.findUserByEmail)(email)) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = yield (0, user_service_1.createUser)(name, email, password, "user");
        res
            .status(201)
            .json({ message: "User registered successfully", user: newUser });
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
        const user = yield (0, user_service_1.findUserByEmail)(email);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        yield (0, user_service_1.updateUserResetToken)(
        // @ts-ignore
        user._id.toString(), resetToken, new Date(Date.now() + 3600000));
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
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const user = yield (0, user_service_1.findUserById)(decoded.userId);
        if (!user ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        // @ts-ignore
        yield (0, user_service_1.updateUserPassword)(user._id.toString(), newPassword);
        // @ts-ignore
        yield (0, user_service_1.updateUserResetToken)(user._id.toString(), "", new Date(0));
        res.status(200).json({ message: "Password has been reset successfully" });
    }
    catch (error) {
        console.error("❌ Error in resetPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.resetPassword = resetPassword;
const getAuthenticatedUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const user = yield (0, user_service_1.findUserById)(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("❌ Error in getAuthenticatedUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAuthenticatedUser = getAuthenticatedUser;
