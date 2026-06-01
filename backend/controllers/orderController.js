import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import orderStatusHistoryModel from "../models/orderStatusHistoryModel.js";
import stripe from "../config/stripe.js";

// Place Order
export const placeOrder = async (req, res) => {
  try {
    const frontend_url = process.env.FRONTEND_URL;
    const { totalAmount, address } = req.body;

    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartData = user.cartData || {};
    if (Object.keys(cartData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate that all items belong to the same restaurant
    let restaurantId = null;
    const orderItems = [];

    for (const itemId in cartData) {
      const food = await foodModel.findById(itemId);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: `Food item not found`,
        });
      }

      if (!restaurantId) {
        restaurantId = food.restaurant;
      } else if (food.restaurant.toString() !== restaurantId.toString()) {
        return res.status(400).json({
          success: false,
          message: "All items in your cart must belong to the same restaurant. Please clear your cart to add items from another restaurant.",
        });
      }

      orderItems.push({
        food: itemId,
        quantity: cartData[itemId],
      });
    }

    const newOrder = new orderModel({
      user: req.userId,
      restaurant: restaurantId,
      items: orderItems,
      amount: totalAmount,
      address,
    });

    await newOrder.save();

    // Stripe line items
    const line_items = [];

    for (const itemId in cartData) {
      const food = await foodModel.findById(itemId);
      if (!food) continue;

      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: food.name,
          },
          unit_amount: food.price * 100,
        },
        quantity: cartData[itemId],
      });
    }

    // Delivery fee
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 500, // $5
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    return res.status(200).json({
      success: true,
      sessionUrl: session.url,
      orderId: newOrder._id,
    });

  } catch (error) {
    console.error("Place Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify Order
export const verifyOrder = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (success === "true") {
      order.status = "PLACED";
      order.payment = true;

      // Clear customer's cart
      await userModel.findByIdAndUpdate(order.user, { cartData: {} });

      // Log status history
      const history = new orderStatusHistoryModel({
        order: order._id,
        status: "PLACED",
        updatedBy: order.user,
      });
      await history.save();
    } else {
      order.status = "CANCELLED";
      order.payment = false;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });

  } catch (error) {
    console.error("Verify Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// User Orders (Customer history)
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.userId, payment: true })
      .populate("restaurant", "name image address")
      .populate("items.food")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("User Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Superadmin get all orders
export const allOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("items.food")
      .populate("restaurant", "name address")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Vendor Pending Orders
export const getVendorPendingOrders = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findOne({ owner: req.userId });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant profile not found for this vendor",
      });
    }

    const orders = await orderModel
      .find({ restaurant: restaurant._id, status: "PLACED", payment: true })
      .populate("user", "name email")
      .populate("items.food")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get Vendor Pending Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Vendor Order History
export const getVendorOrderHistory = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findOne({ owner: req.userId });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant profile not found for this vendor",
      });
    }

    const orders = await orderModel
      .find({ restaurant: restaurant._id, payment: true })
      .populate("user", "name email")
      .populate("items.food")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get Vendor Order History Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Vendor Accept Order
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify ownership
    const restaurant = await restaurantModel.findOne({ owner: req.userId });
    if (!restaurant || order.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this order" });
    }

    if (order.status !== "PLACED") {
      return res.status(400).json({ success: false, message: "Only PLACED orders can be accepted" });
    }

    order.status = "ACCEPTED";
    await order.save();

    // Log status history
    const history = new orderStatusHistoryModel({
      order: order._id,
      status: "ACCEPTED",
      updatedBy: req.userId,
    });
    await history.save();

    return res.status(200).json({ success: true, message: "Order accepted successfully", order });
  } catch (error) {
    console.error("Accept Order Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Vendor Reject Order
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify ownership
    const restaurant = await restaurantModel.findOne({ owner: req.userId });
    if (!restaurant || order.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this order" });
    }

    if (order.status !== "PLACED") {
      return res.status(400).json({ success: false, message: "Only PLACED orders can be rejected" });
    }

    order.status = "REJECTED";
    await order.save();

    // Log status history
    const history = new orderStatusHistoryModel({
      order: order._id,
      status: "REJECTED",
      updatedBy: req.userId,
    });
    await history.save();

    return res.status(200).json({ success: true, message: "Order rejected successfully", order });
  } catch (error) {
    console.error("Reject Order Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Valid Transitions Check
const isValidTransition = (current, next) => {
  if (next === "CANCELLED") return true;
  if (current === "PLACED" && next === "ACCEPTED") return true;
  if (current === "ACCEPTED" && next === "PREPARING") return true;
  if (current === "PREPARING" && next === "READY") return true;
  if (current === "READY" && next === "OUT_FOR_DELIVERY") return true;
  if (current === "OUT_FOR_DELIVERY" && next === "DELIVERED") return true;
  return false;
};

// Update Vendor Order Status
export const updateVendorOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify ownership
    const restaurant = await restaurantModel.findOne({ owner: req.userId });
    if (!restaurant || order.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this order" });
    }

    if (!isValidTransition(order.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    // Log status history
    const history = new orderStatusHistoryModel({
      order: order._id,
      status: status,
      updatedBy: req.userId,
    });
    await history.save();

    return res.status(200).json({ success: true, message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Deprecated Status Update (kept for backward compatibility, mapped to updated status)
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};