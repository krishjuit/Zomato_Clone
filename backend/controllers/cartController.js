import userModel from "../models/userModel.js";

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let cartData = user.cartData || {};

    cartData[itemId] = (cartData[itemId] || 0) + 1;

    user.cartData = cartData;
    user.markModified("cartData");

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cartData,
    });
  } catch (error) {
    console.error("Add Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let cartData = user.cartData || {};

    if (cartData[itemId]) {
      cartData[itemId] -= 1;

      if (cartData[itemId] <= 0) {
        delete cartData[itemId];
      }
    }

    user.cartData = cartData;
    user.markModified("cartData");

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cartData,
    });
  } catch (error) {
    console.error("Remove Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get cart data
export const getCartItems = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      cartData: user.cartData || {},
    });

  } catch (error) {
    console.error("Get Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let cartData = user.cartData || {};

    // Remove the item completely
    delete cartData[itemId];

    user.cartData = cartData;
    user.markModified("cartData");

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item deleted from cart",
      cartData,
    });

  } catch (error) {
    console.error("Delete Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};