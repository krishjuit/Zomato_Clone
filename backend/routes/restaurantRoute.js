import express from "express";
import {
  createRestaurant,
  getRestaurantById,
  listRestaurants,
  updateRestaurant,
} from "../controllers/restaurantController.js";
import authMiddleware from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const restaurantRouter = express.Router();

restaurantRouter.get("/list", listRestaurants);
restaurantRouter.get("/:id", getRestaurantById);

restaurantRouter.post(
  "/",
  authMiddleware,
  roleAuth(["vendor", "superadmin"]),
  createRestaurant
);

restaurantRouter.put(
  "/:id",
  authMiddleware,
  roleAuth(["vendor", "superadmin"]),
  updateRestaurant
);

export default restaurantRouter;
