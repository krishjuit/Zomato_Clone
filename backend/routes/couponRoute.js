import express from "express";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listCoupons,
  validateCoupon,
} from "../controllers/couponController.js";
import authMiddleware from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import validateObjectId from "../middleware/validateObjectId.js";

const couponRouter = express.Router();

couponRouter.post(
  "/create",
  authMiddleware,
  roleAuth(["vendor", "superadmin"]),
  createCoupon
);

couponRouter.put(
  "/update/:id",
  authMiddleware,
  roleAuth(["vendor", "superadmin"]),
  validateObjectId,
  updateCoupon
);

couponRouter.delete(
  "/delete/:id",
  authMiddleware,
  roleAuth(["vendor", "superadmin"]),
  validateObjectId,
  deleteCoupon
);

// Unified list router: allows superadmin, vendor, and customer scoping
couponRouter.get("/list", authMiddleware, listCoupons);

couponRouter.post("/validate", authMiddleware, roleAuth(["customer"]), validateCoupon);

export default couponRouter;
