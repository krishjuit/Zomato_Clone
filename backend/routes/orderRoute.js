import express from "express";
import {
  allOrders,
  placeOrder,
  updateStatus,
  userOrders,
  verifyOrder,
  getVendorPendingOrders,
  getVendorOrderHistory,
  acceptOrder,
  rejectOrder,
  updateVendorOrderStatus,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import validateObjectId from "../middleware/validateObjectId.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);

// Superadmin only
orderRouter.get("/allorders", authMiddleware, roleAuth(["superadmin"]), allOrders);

// Vendor only
orderRouter.get("/vendor/pending", authMiddleware, roleAuth(["vendor"]), getVendorPendingOrders);
orderRouter.get("/vendor/history", authMiddleware, roleAuth(["vendor"]), getVendorOrderHistory);
orderRouter.put("/vendor/accept/:id", authMiddleware, roleAuth(["vendor"]), validateObjectId, acceptOrder);
orderRouter.put("/vendor/reject/:id", authMiddleware, roleAuth(["vendor"]), validateObjectId, rejectOrder);
orderRouter.put("/vendor/status/:id", authMiddleware, roleAuth(["vendor"]), validateObjectId, updateVendorOrderStatus);

// Deprecated, kept for backward compatibility
orderRouter.post("/updatestatus", authMiddleware, roleAuth(["superadmin"]), updateStatus);
export default orderRouter;