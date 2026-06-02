import express from "express";
import {
  getVendorAnalytics,
  getAdminAnalytics,
} from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/vendor", authMiddleware, roleAuth(["vendor"]), getVendorAnalytics);
analyticsRouter.get("/admin", authMiddleware, roleAuth(["superadmin"]), getAdminAnalytics);

export default analyticsRouter;
