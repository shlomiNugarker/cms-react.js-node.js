import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/database/db";
import { config } from "./src/config";
import userRoutes from "./src/routes/user.routes";
import authRoutes from "./src/routes/auth.routes";
import contentRoutes from "./src/routes/content.routes";
import categoryRoutes from "./src/routes/category.routes";
import mediaRoutes from "./src/routes/media.routes";
import menuRoutes from "./src/routes/menu.routes";
import siteSettingsRoutes from "./src/routes/siteSettings.routes";
import pagesRoutes from "./src/routes/pages.routes";
import postsRoutes from "./src/routes/posts.routes";
import productsRoutes from "./src/routes/products.routes";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: config.isProduction },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: config.allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Request logging
app.use(morgan(config.isProduction ? "combined" : "dev"));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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
        url: `http://localhost:${config.port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/products", productsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Global error handler improvement
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Server Error:", JSON.stringify(err, null, 2));
  
  // Check if error has statusCode property
  const statusCode = (err as any).statusCode || 500;
  const message = (err as any).message || "Internal Server Error";
  
  // Don't expose stack traces in production
  const errorResponse = {
    error: message,
    ...(config.isProduction ? {} : { stack: err.stack })
  };
  
  res.status(statusCode).json(errorResponse);
});

connectDB();

server.listen(config.port, () => {
  console.log(`🚀 Server is running on port ${config.port}`);
});
