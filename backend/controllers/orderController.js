
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import stripe from "../config/stripe.js";



export const placeOrder = async (req, res) => {
  try {
    const frontend_url =
      process.env.FRONTEND_URL;

    const { totalAmount, address } = req.body;

    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartData = user.cartData || {};

    // Convert cartData object into schema format
    const orderItems = [];

    for (const itemId in cartData) {
      orderItems.push({
        food: itemId,
        quantity: cartData[itemId],
      });
    }

    const newOrder = new orderModel({
      user: req.userId,
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

    const session =
      await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",

        success_url:
          `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,

        cancel_url:
          `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
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
      order.status = "Confirmed";
      order.payment = true;

      await userModel.findByIdAndUpdate(
        order.user,
        {
          cartData: {},
        }
      );
    } else {
      order.status = "Cancelled";
      order.payment = false;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//user orders for frontend

export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.userId })
      .populate("items.food");  
    return res.status(200).json({
      success: true,
      orders,
    });
  }
    catch (error) {
    console.error("User Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
   }
};

export const allOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("items.food")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(
      orderId,
      { status }
    );

    res.status(200).json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};