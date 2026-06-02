import express from "express";
import {
  createReview,
  getRestaurantReviews,
  getFoodReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import authMiddleware from "../middleware/auth.js";
import validateObjectId from "../middleware/validateObjectId.js";

const reviewRouter = express.Router();

reviewRouter.post("/create", authMiddleware, createReview);
reviewRouter.get("/restaurant/:id", validateObjectId, getRestaurantReviews);
reviewRouter.get("/food/:id", validateObjectId, getFoodReviews);
reviewRouter.delete("/:id", authMiddleware, validateObjectId, deleteReview);

export default reviewRouter;
