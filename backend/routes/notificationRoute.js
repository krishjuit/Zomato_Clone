import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/auth.js";
import validateObjectId from "../middleware/validateObjectId.js";

const notificationRouter = express.Router();

// List notifications
notificationRouter.get("/list", authMiddleware, getNotifications);

// Mark single as read
notificationRouter.post("/read/:id", authMiddleware, validateObjectId, markAsRead);

// Mark all as read
notificationRouter.post("/read-all", authMiddleware, markAllAsRead);

export default notificationRouter;
