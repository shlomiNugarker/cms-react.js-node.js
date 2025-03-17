"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("./src/database/db");
const config_1 = require("./src/config");
const user_routes_1 = __importDefault(require("./src/routes/user.routes"));
const auth_routes_1 = __importDefault(require("./src/routes/auth.routes"));
const content_routes_1 = __importDefault(require("./src/routes/content.routes"));
const category_routes_1 = __importDefault(require("./src/routes/category.routes"));
const media_routes_1 = __importDefault(require("./src/routes/media.routes"));
const menu_routes_1 = __importDefault(require("./src/routes/menu.routes"));
const siteSettings_routes_1 = __importDefault(require("./src/routes/siteSettings.routes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, express_session_1.default)({
    secret: config_1.config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: config_1.config.isProduction },
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: config_1.config.allowedOrigins,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Security middleware
app.use((0, helmet_1.default)());
// Request logging
app.use((0, morgan_1.default)(config_1.config.isProduction ? "combined" : "dev"));
// Rate limiting
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", apiLimiter);
// Swagger documentation
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "API documentation for the application",
        },
        servers: [
            {
                url: `http://localhost:${config_1.config.port}`,
            },
        ],
    },
    apis: ["./src/routes/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// API Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/content", content_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/media", media_routes_1.default);
app.use("/api/menus", menu_routes_1.default);
app.use("/api/site-settings", siteSettings_routes_1.default);
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        time: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Serve uploaded files
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
// Serve static files
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "public", "index.html"));
});
// Global error handler improvement
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", JSON.stringify(err, null, 2));
    // Check if error has statusCode property
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    // Don't expose stack traces in production
    const errorResponse = Object.assign({ error: message }, (config_1.config.isProduction ? {} : { stack: err.stack }));
    res.status(statusCode).json(errorResponse);
});
(0, db_1.connectDB)();
server.listen(config_1.config.port, () => {
    console.log(`🚀 Server is running on port ${config_1.config.port}`);
});
