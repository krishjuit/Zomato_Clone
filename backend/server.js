import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import restaurantRouter from "./routes/restaurantRoute.js";
import couponRouter from "./routes/couponRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import analyticsRouter from "./routes/analyticsRoute.js";

dotenv.config();

const app = express(); // ✅ MUST be first

const port = process.env.PORT || 4000;

// Middlewares
app.use(cors());
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

// Test route
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});