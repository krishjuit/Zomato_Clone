import restaurantModel from "../models/restaurantModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// Create Restaurant
export const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, image, cuisine } = req.body;
    const ownerId = req.userId;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, address)",
      });
    }

    const user = await userModel.findById(ownerId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Owner user not found",
      });
    }

    if (user.role !== "vendor" && user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only vendors and superadmins can create a restaurant",
      });
    }

    const existingRestaurant = await restaurantModel.findOne({ owner: ownerId });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Owner already owns a restaurant",
      });
    }

    const newRestaurant = new restaurantModel({
      name,
      owner: ownerId,
      description,
      address,
      image,
      cuisine: cuisine || [],
    });

    await newRestaurant.save();

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant: newRestaurant,
    });
  } catch (error) {
    console.error("Create Restaurant Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantModel.findById(id).populate("owner", "name email");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Get Restaurant Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Restaurants (supporting pagination)
export const listRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    // If page and limit are not specified, return all active restaurants (backward compatibility)
    if (!page || !limit) {
      const restaurants = await restaurantModel.find({ isActive: true }).populate("owner", "name email");
      return res.status(200).json({
        success: true,
        restaurants,
      });
    }

    const skip = (page - 1) * limit;
    const total = await restaurantModel.countDocuments({ isActive: true });
    const restaurants = await restaurantModel
      .find({ isActive: true })
      .populate("owner", "name email")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      restaurants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List Restaurants Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Restaurant
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, image, cuisine, isActive } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    const restaurant = await restaurantModel.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (restaurant.owner.toString() !== userId && userRole !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this restaurant",
      });
    }

    if (name) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (address) restaurant.address = address;
    if (image !== undefined) restaurant.image = image;
    if (cuisine) restaurant.cuisine = cuisine;
    if (isActive !== undefined) restaurant.isActive = isActive;

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Update Restaurant Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Restaurant Menu (supporting pagination)
export const getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const restaurant = await restaurantModel.findById(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const query = { restaurant: id, isAvailable: true };
    const total = await foodModel.countDocuments(query);
    const menu = await foodModel
      .find(query)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      menu,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Restaurant Menu Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search Restaurants & Foods (supporting name, cuisine, category)
export const searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({
        success: true,
        restaurants: [],
        foods: [],
      });
    }

    const regex = new RegExp(q, "i");

    // Search Restaurants: matches name OR cuisine array
    const restaurants = await restaurantModel.find({
      isActive: true,
      $or: [
        { name: regex },
        { cuisine: regex }
      ]
    }).populate("owner", "name email");

    // Find restaurant IDs whose names match the query (to show their dishes too)
    const matchingRestaurants = await restaurantModel.find({
      isActive: true,
      name: regex
    }).select("_id");
    const restaurantIds = matchingRestaurants.map(r => r._id);

    // Search Foods: matches name OR category OR description OR restaurant ID
    const foods = await foodModel.find({
      isAvailable: true,
      $or: [
        { name: regex },
        { category: regex },
        { description: regex },
        { restaurant: { $in: restaurantIds } }
      ]
    }).populate("restaurant", "name address image");

    return res.status(200).json({
      success: true,
      restaurants,
      foods,
    });
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
