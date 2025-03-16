"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
    var _a;
    console.log(req.header("Authorization"));
    console.log("authMiddleware");
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ message: "Unauthorized, no token" });
    }
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded) {
        return res.status(401).json({ message: "Unauthorized, invalid token" });
    }
    // @ts-ignore
    req.userId = decoded.userId;
    next();
};
exports.authMiddleware = authMiddleware;
