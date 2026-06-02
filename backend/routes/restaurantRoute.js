import express from "express";
import {
  createRestaurant,
  getRestaurantById,
  listRestaurants,
  updateRestaurant,
  getRestaurantMenu,
  searchAll,
} from "../controllers/restaurantController.js";
import authMiddleware from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const restaurantRouter = express.Router();

restaurantRouter.get("/list", listRestaurants);
restaurantRouter.get("/search", searchAll);
restaurantRouter.get("/:id", getRestaurantById);
restaurantRouter.get("/:id/menu", getRestaurantMenu);

restaurantRouter.post(
  "/",
  authMiddleware,
  roleAuth(["vendor"]),
  createRestaurant
);

restaurantRouter.put(
  "/:id",
  authMiddleware,
  roleAuth(["vendor"]),
  updateRestaurant
);

export default restaurantRouter;
