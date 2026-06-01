import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import cloudinary from "../config/cloudinary.js";

// add food item
const addFood = async (req, res) => {
  try {
    const { name, description, price, category, restaurantId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    let targetRestaurantId;

    if (req.userRole === "superadmin") {
      if (!restaurantId) {
        return res.status(400).json({ message: "restaurantId is required for superadmin" });
      }
      targetRestaurantId = restaurantId;
    } else {
      // Vendor
      const restaurant = await restaurantModel.findOne({ owner: req.userId });
      if (!restaurant) {
        return res.status(400).json({ message: "Please create a restaurant profile before adding food items" });
      }
      targetRestaurantId = restaurant._id;
    }

    const image_url = req.file.path; // 👈 Cloudinary URL

    const newFood = new foodModel({
      name,
      description,
      price: Number(price),
      category,
      image: image_url,
      restaurant: targetRestaurantId,
    });

    await newFood.save();

    res.status(201).json({
      message: "Food item added successfully",
      food: newFood,
    });

  } catch (error) {
    console.error("Add Food Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// all food list
const listfood = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let query = {};

    if (restaurantId) {
      query.restaurant = restaurantId;
    }

    const foodList = await foodModel.find(query).populate("restaurant", "name");
    res.status(200).json(foodList);
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ message: "Failed to fetch food items" });
  }
};

// get single food item by ID
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const foodItem = await foodModel.findById(id).populate("restaurant", "name");

    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json(foodItem);
  } catch (error) {
    console.error("Get Food By ID Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// update food item
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, isAvailable } = req.body;

    const foodItem = await foodModel.findById(id);
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Ownership check: must be owner vendor or superadmin
    if (req.userRole !== "superadmin") {
      const restaurant = await restaurantModel.findOne({ owner: req.userId });
      if (!restaurant || foodItem.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({ message: "Unauthorized: You do not own the restaurant associated with this food item" });
      }
    }

    if (name) foodItem.name = name;
    if (description) foodItem.description = description;
    if (price) foodItem.price = Number(price);
    if (category) foodItem.category = category;
    if (isAvailable !== undefined) foodItem.isAvailable = isAvailable === "true" || isAvailable === true;

    if (req.file) {
      // Delete old image from Cloudinary
      const imageUrl = foodItem.image;
      if (imageUrl) {
        const parts = imageUrl.split("/");
        const fileName = parts[parts.length - 1];
        const publicId = "food_images/" + fileName.split(".")[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed to destroy old Cloudinary image:", err);
        }
      }
      foodItem.image = req.file.path;
    }

    await foodItem.save();

    res.status(200).json({
      message: "Food item updated successfully",
      food: foodItem,
    });

  } catch (error) {
    console.error("Update Food Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    const { id } = req.params;

    const foodItem = await foodModel.findById(id);

    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Ownership check: must be owner vendor or superadmin
    if (req.userRole !== "superadmin") {
      const restaurant = await restaurantModel.findOne({ owner: req.userId });
      if (!restaurant || foodItem.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({ message: "Unauthorized: You do not own the restaurant associated with this food item" });
      }
    }

    // Extract public_id from Cloudinary URL
    const imageUrl = foodItem.image;

    if (imageUrl) {
      const parts = imageUrl.split("/");
      const fileName = parts[parts.length - 1];
      const publicId = "food_images/" + fileName.split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Failed to destroy Cloudinary image on delete:", err);
      }
    }

    await foodModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Food item removed successfully" });

  } catch (error) {
    console.error("Error removing food item:", error);
    res.status(500).json({ message: error.message });
  }
};

export { addFood, listfood, getFoodById, updateFood, removeFood };