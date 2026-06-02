import reviewModel from "../models/reviewModel.js";
import orderModel from "../models/orderModel.js";
import restaurantModel from "../models/restaurantModel.js";
import foodModel from "../models/foodModel.js";

// Helper to recalculate restaurant stats
const updateRestaurantRatingStats = async (restaurantId) => {
  try {
    const reviews = await reviewModel.find({ restaurant: restaurantId });
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    await restaurantModel.findByIdAndUpdate(restaurantId, {
      averageRating: Math.round(avg * 10) / 10,
      ratingCount: count,
    });
  } catch (err) {
    console.error("Recalculate Restaurant Stats Error:", err);
  }
};

// Helper to recalculate food stats
const updateFoodRatingStats = async (foodId) => {
  try {
    const reviews = await reviewModel.find({ food: foodId });
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    await foodModel.findByIdAndUpdate(foodId, {
      averageRating: Math.round(avg * 10) / 10,
      ratingCount: count,
    });
  } catch (err) {
    console.error("Recalculate Food Stats Error:", err);
  }
};

// Create Review
export const createReview = async (req, res) => {
  try {
    const { restaurantId, foodId, orderId, rating, review } = req.body;
    const userId = req.userId;

    if (!restaurantId || !orderId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Restaurant, order, rating (1-5), and review text are required.",
      });
    }

    // 1. Verify order belongs to user and is completed (DELIVERED)
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You did not place this order.",
      });
    }

    if (order.status !== "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed (delivered) orders.",
      });
    }

    // 2. If reviewing a food item, verify it exists in the order
    if (foodId) {
      const containsFood = order.items.some(
        (item) => item.food.toString() === foodId.toString()
      );
      if (!containsFood) {
        return res.status(400).json({
          success: false,
          message: "This dish was not part of the specified order.",
        });
      }
    }

    // 3. Prevent duplicate reviews for the same order + food combination
    const targetFood = foodId || null;
    const existing = await reviewModel.findOne({ order: orderId, food: targetFood });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this item/restaurant in this order.",
      });
    }

    // 4. Create review
    const newReview = new reviewModel({
      user: userId,
      restaurant: restaurantId,
      food: targetFood,
      order: orderId,
      rating: Number(rating),
      review,
    });

    await newReview.save();

    // 5. Trigger rating stats recalculations
    await updateRestaurantRatingStats(restaurantId);
    if (foodId) {
      await updateFoodRatingStats(foodId);
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Create Review Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Restaurant Reviews
export const getRestaurantReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await reviewModel
      .find({ restaurant: id, food: null })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Get Restaurant Reviews Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Food Reviews
export const getFoodReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await reviewModel
      .find({ food: id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Get Food Reviews Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await reviewModel.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Owner or superadmin only
    if (review.user.toString() !== req.userId.toString() && req.userRole !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this review",
      });
    }

    await reviewModel.findByIdAndDelete(id);

    // Recalculate stats
    await updateRestaurantRatingStats(review.restaurant);
    if (review.food) {
      await updateFoodRatingStats(review.food);
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
