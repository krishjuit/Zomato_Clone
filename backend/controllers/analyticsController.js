import orderModel from "../models/orderModel.js";
import restaurantModel from "../models/restaurantModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// GET /api/analytics/vendor
export const getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.userId;

    // Find vendor's restaurant
    const restaurant = await restaurantModel.findOne({ owner: vendorId });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant profile not found for this vendor.",
      });
    }

    // Query all orders belonging to this restaurant
    const orders = await orderModel
      .find({ restaurant: restaurant._id, payment: true })
      .populate("items.food");

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "PLACED").length;
    const activeOrders = orders.filter((o) =>
      ["ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(o.status)
    ).length;
    const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
    const cancelledOrders = orders.filter((o) =>
      ["CANCELLED", "REJECTED"].includes(o.status)
    ).length;

    // Calculate revenue (exclude cancelled/rejected orders)
    const activeRevenueOrders = orders.filter(
      (o) => !["CANCELLED", "REJECTED"].includes(o.status)
    );

    const totalRevenue = activeRevenueOrders.reduce((sum, o) => sum + o.amount, 0);

    // Revenue this calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = activeRevenueOrders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + o.amount, 0);

    // Compute top selling foods
    const foodSalesMap = {};
    orders.forEach((order) => {
      // Only count sales for successful/active orders
      if (["CANCELLED", "REJECTED"].includes(order.status)) return;

      order.items.forEach((item) => {
        if (!item.food) return;
        const foodId = item.food._id.toString();
        const quantity = item.quantity || 0;
        const price = item.food.price || 0;

        if (!foodSalesMap[foodId]) {
          foodSalesMap[foodId] = {
            name: item.food.name,
            quantity: 0,
            revenue: 0,
          };
        }
        foodSalesMap[foodId].quantity += quantity;
        foodSalesMap[foodId].revenue += quantity * price;
      });
    });

    const topSellingFoods = Object.values(foodSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      analytics: {
        restaurantName: restaurant.name,
        totalOrders,
        pendingOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        revenueThisMonth: Math.round(monthlyRevenue * 100) / 100,
        topSellingFoods,
      },
    });
  } catch (error) {
    console.error("Get Vendor Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/analytics/admin
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Total Restaurants
    const totalRestaurants = await restaurantModel.countDocuments({});
    const activeRestaurants = await restaurantModel.countDocuments({ isActive: true });

    // 2. Active Vendors
    const activeVendors = await userModel.countDocuments({ role: "vendor" });

    // 3. Orders stats
    const orders = await orderModel.find({ payment: true });
    const totalOrders = orders.length;

    const activeRevenueOrders = orders.filter(
      (o) => !["CANCELLED", "REJECTED"].includes(o.status)
    );
    const totalRevenue = activeRevenueOrders.reduce((sum, o) => sum + o.amount, 0);

    // 4. Top Restaurants by revenue
    const restaurantRevenueMap = {};
    const allRestaurants = await restaurantModel.find({});
    allRestaurants.forEach((r) => {
      restaurantRevenueMap[r._id.toString()] = {
        name: r.name,
        revenue: 0,
        orders: 0,
      };
    });

    orders.forEach((order) => {
      if (!order.restaurant) return;
      const restId = order.restaurant.toString();
      if (!restaurantRevenueMap[restId]) {
        restaurantRevenueMap[restId] = {
          name: "Unknown Restaurant",
          revenue: 0,
          orders: 0,
        };
      }
      restaurantRevenueMap[restId].orders += 1;
      if (!["CANCELLED", "REJECTED"].includes(order.status)) {
        restaurantRevenueMap[restId].revenue += order.amount;
      }
    });

    const topRestaurants = Object.values(restaurantRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      analytics: {
        totalRestaurants,
        activeRestaurants,
        activeVendors,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        topRestaurants,
      },
    });
  } catch (error) {
    console.error("Get Admin Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
