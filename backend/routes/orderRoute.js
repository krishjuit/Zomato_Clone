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

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);

// Superadmin only
orderRouter.get("/allorders", authMiddleware, roleAuth(["superadmin"]), allOrders);

// Vendor only
orderRouter.get("/vendor/pending", authMiddleware, roleAuth(["vendor"]), getVendorPendingOrders);
orderRouter.get("/vendor/history", authMiddleware, roleAuth(["vendor"]), getVendorOrderHistory);
orderRouter.put("/vendor/accept/:id", authMiddleware, roleAuth(["vendor"]), acceptOrder);
orderRouter.put("/vendor/reject/:id", authMiddleware, roleAuth(["vendor"]), rejectOrder);
orderRouter.put("/vendor/status/:id", authMiddleware, roleAuth(["vendor"]), updateVendorOrderStatus);

// Deprecated, kept for backward compatibility
orderRouter.post("/updatestatus", updateStatus);
export default orderRouter;