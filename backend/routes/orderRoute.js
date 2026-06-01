import express from "express";
import { allOrders, placeOrder, updateStatus, userOrders, verifyOrder } from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);

orderRouter.post("/verify", verifyOrder);

orderRouter.post("/userorders",authMiddleware,userOrders);
;
orderRouter.get("/allorders", allOrders);

orderRouter.post(
  "/updatestatus",
  updateStatus
);
export default orderRouter;