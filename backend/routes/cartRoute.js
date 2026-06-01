import express from "express"
import {addToCart, getCartItems, removeFromCart,deleteFromCart} from "../controllers/cartController.js";
import authMiddleware from "../middleware/auth.js";
const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.get("/get", authMiddleware, getCartItems);
cartRouter.post("/delete", authMiddleware, deleteFromCart);
export default cartRouter;