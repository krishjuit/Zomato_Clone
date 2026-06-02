import dotenv from "dotenv";
dotenv.config();

// Enforce environment validation on startup
const requiredEnv = [
  "MONGO_URL",
  "JWT_SECRET",
  "CLOUDINARY_NAME",
  "CLOUDINARY_KEY",
  "CLOUDINARY_SECRET",
  "STRIPE_SECRET_KEY",
  "SUPERADMIN_EMAIL",
  "SUPERADMIN_PASSWORD",
  "DEFAULT_VENDOR_EMAIL",
  "DEFAULT_VENDOR_PASSWORD",
  "FRONTEND_URL",
  "ADMIN_URL",
];

for (const key of requiredEnv) {
  if (!process.env[key] || !process.env[key].trim()) {
    console.error(`CRITICAL STARTUP ERROR: Required environment variable "${key}" is missing or empty.`);
    process.exit(1);
  }
}

// Enforce JWT strength validation (Recommend production secret length > 32 characters)
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret.length < 32) {
  console.warn(`WARNING: JWT_SECRET is too weak (${jwtSecret.length} characters). It is highly recommended to use a cryptographically secure key of at least 32 characters in production.`);
}

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import restaurantRouter from "./routes/restaurantRoute.js";
import couponRouter from "./routes/couponRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import analyticsRouter from "./routes/analyticsRoute.js";
import notificationRouter from "./routes/notificationRoute.js";

const app = express(); // ✅ MUST be first

const port = process.env.PORT || 4000;

// Middlewares
const allowedOrigins = [
  process.env.FRONTEND_URL.trim(),
  process.env.ADMIN_URL.trim()
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, server-to-server, or local dev tools)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// DB connection
connectDB();

// API routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/review", reviewRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/notification", notificationRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});