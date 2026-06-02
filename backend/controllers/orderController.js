import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import orderStatusHistoryModel from "../models/orderStatusHistoryModel.js";
import notificationModel from "../models/notificationModel.js";
import couponModel from "../models/couponModel.js";
import stripe from "../config/stripe.js";

// Place Order
export const placeOrder = async (req, res) => {
  try {
    const frontend_url = process.env.FRONTEND_URL;
    const { totalAmount, address, couponCode } = req.body;

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

    // Recalculate subtotal on backend
    let subtotal = 0;
    for (const itemId in cartData) {
      const food = await foodModel.findById(itemId);
      if (food) {
        subtotal += food.price * cartData[itemId];
      }
    }

    // Validate and calculate discount
    let discountAmount = 0;
    let validCouponCode = null;

    if (couponCode) {
      const uppercaseCode = couponCode.trim().toUpperCase();
      const couponObj = await couponModel.findOne({ code: uppercaseCode, isActive: true });
      if (couponObj) {
        const today = new Date();
        if (new Date(couponObj.expiryDate) > today && couponObj.usedCount < couponObj.usageLimit) {
          // Check restaurant scope
          if (couponObj.isGlobal || couponObj.restaurant.toString() === restaurantId.toString()) {
            if (subtotal >= couponObj.minimumOrderAmount) {
              validCouponCode = couponObj.code;
              if (couponObj.discountType === "percentage") {
                discountAmount = subtotal * (couponObj.discountValue / 100);
                if (couponObj.maximumDiscount > 0 && discountAmount > couponObj.maximumDiscount) {
                  discountAmount = couponObj.maximumDiscount;
                }
              } else if (couponObj.discountType === "flat") {
                discountAmount = couponObj.discountValue;
              }
              if (discountAmount > subtotal) {
                discountAmount = subtotal;
              }
              discountAmount = Math.round(discountAmount * 100) / 100;
            }
          }
        }
      }
    }

    const calculatedTotal = subtotal + 5 - discountAmount;

    const newOrder = new orderModel({
      user: req.userId,
      restaurant: restaurantId,
      items: orderItems,
      amount: calculatedTotal,
      address,
      couponCode: validCouponCode,
      discount: discountAmount,
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

    const checkoutSessionPayload = {
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    };

    // If discount is applied, create a Stripe coupon and link it
    if (discountAmount > 0) {
      try {
        const stripeCoupon = await stripe.coupons.create({
          amount_off: Math.round(discountAmount * 100),
          currency: "usd",
          duration: "once",
          name: `Promo Discount (${validCouponCode})`,
        });
        checkoutSessionPayload.discounts = [{ coupon: stripeCoupon.id }];
      } catch (stripeErr) {
        console.error("Stripe Coupon Creation Error:", stripeErr);
      }
    }

    const session = await stripe.checkout.sessions.create(checkoutSessionPayload);

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

      // Update coupon usage if couponCode was used
      if (order.couponCode) {
        await couponModel.findOneAndUpdate(
          { code: order.couponCode },
          { $inc: { usedCount: 1 } }
        );
      }

      // Log status history
      const history = new orderStatusHistoryModel({
        order: order._id,
        status: "PLACED",
        updatedBy: order.user,
      });
      await history.save();

      // Send Vendor Notification
      const restaurant = await restaurantModel.findById(order.restaurant);
      if (restaurant) {
        const notif = new notificationModel({
          user: restaurant.owner,
          type: "new_order_received",
          message: `New order #${order._id.toString().slice(-6)} received for ${restaurant.name}.`,
          order: order._id,
        });
        await notif.save();
      }
    } else {
      order.status = "CANCELLED";
      order.payment = false;

      // Log status history
      const history = new orderStatusHistoryModel({
        order: order._id,
        status: "CANCELLED",
        updatedBy: order.user,
      });
      await history.save();
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

    // Send Customer Notification
    const notif = new notificationModel({
      user: order.user,
      type: "order_accepted",
      message: `Your order #${order._id.toString().slice(-6)} from ${restaurant.name} has been accepted and is being prepared.`,
      order: order._id,
    });
    await notif.save();

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

    // Send Customer Notification
    const notif = new notificationModel({
      user: order.user,
      type: "order_rejected",
      message: `Your order #${order._id.toString().slice(-6)} from ${restaurant.name} has been rejected.`,
      order: order._id,
    });
    await notif.save();

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

    // Send Customer Notification if Delivered
    if (status === "DELIVERED") {
      const notif = new notificationModel({
        user: order.user,
        type: "order_delivered",
        message: `Your order #${order._id.toString().slice(-6)} from ${restaurant.name} has been delivered!`,
        order: order._id,
      });
      await notif.save();
    }

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

    // Log status history
    const history = new orderStatusHistoryModel({
      order: order._id,
      status: status,
      updatedBy: req.userId || order.user,
    });
    await history.save();

    // Send Customer Notification
    if (["ACCEPTED", "REJECTED", "DELIVERED"].includes(status)) {
      const restaurant = await restaurantModel.findById(order.restaurant);
      const restName = restaurant ? restaurant.name : "Restaurant";
      
      let notifType = "";
      let notifMsg = "";
      if (status === "ACCEPTED") {
        notifType = "order_accepted";
        notifMsg = `Your order #${order._id.toString().slice(-6)} from ${restName} has been accepted and is being prepared.`;
      } else if (status === "REJECTED") {
        notifType = "order_rejected";
        notifMsg = `Your order #${order._id.toString().slice(-6)} from ${restName} has been rejected.`;
      } else if (status === "DELIVERED") {
        notifType = "order_delivered";
        notifMsg = `Your order #${order._id.toString().slice(-6)} from ${restName} has been delivered!`;
      }
      
      const notif = new notificationModel({
        user: order.user,
        type: notifType,
        message: notifMsg,
        order: order._id,
      });
      await notif.save();
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};