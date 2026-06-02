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
import validateObjectId from "../middleware/validateObjectId.js";

const restaurantRouter = express.Router();

restaurantRouter.get("/list", listRestaurants);
restaurantRouter.get("/search", searchAll);
restaurantRouter.get("/:id", validateObjectId, getRestaurantById);
restaurantRouter.get("/:id/menu", validateObjectId, getRestaurantMenu);

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
  validateObjectId,
  updateRestaurant
);

export default restaurantRouter;
