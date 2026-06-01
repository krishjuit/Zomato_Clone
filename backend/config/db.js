import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import restaurantModel from "../models/restaurantModel.js";
import orderModel from "../models/orderModel.js";
import orderStatusHistoryModel from "../models/orderStatusHistoryModel.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");

    // Ensure default vendor & restaurant exist for migrations if needed
    let defaultVendor = null;
    let defaultRestaurant = null;

    const setupDefaultRestaurant = async () => {
      if (defaultRestaurant) return defaultRestaurant;
      defaultVendor = await userModel.findOne({ email: "default_vendor@zomato.com" });
      if (!defaultVendor) {
        console.log("Creating default vendor account...");
        const hashedPassword = await bcrypt.hash("vendor123", 10);
        defaultVendor = await userModel.create({
          name: "Default Vendor",
          email: "default_vendor@zomato.com",
          password: hashedPassword,
          role: "vendor",
        });
      }

      defaultRestaurant = await restaurantModel.findOne({ owner: defaultVendor._id });
      if (!defaultRestaurant) {
        console.log("Creating default restaurant profile...");
        defaultRestaurant = await restaurantModel.create({
          name: "Default Kitchen",
          owner: defaultVendor._id,
          description: "System default restaurant for legacy menu items",
          address: "123 Main Street, City Center",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
          cuisine: ["Varies"],
        });
      }
      return defaultRestaurant;
    };

    // Auto-migration for legacy foods
    const orphanedFoodsCount = await foodModel.countDocuments({ restaurant: { $exists: false } });
    if (orphanedFoodsCount > 0) {
      console.log(`Found ${orphanedFoodsCount} legacy food items without a restaurant reference. Starting auto-migration...`);
      const rest = await setupDefaultRestaurant();
      const updateResult = await foodModel.updateMany(
        { restaurant: { $exists: false } },
        { $set: { restaurant: rest._id } }
      );
      console.log(`Auto-migration completed successfully! Assigned ${updateResult.modifiedCount} items to Default Kitchen.`);
    }

    // Auto-migration for legacy orders
    const orphanedOrdersCount = await orderModel.countDocuments({ restaurant: { $exists: false } });
    if (orphanedOrdersCount > 0) {
      console.log(`Found ${orphanedOrdersCount} legacy orders without a restaurant reference. Starting auto-migration...`);
      const rest = await setupDefaultRestaurant();

      const legacyOrders = await orderModel.find({ restaurant: { $exists: false } });
      let migratedCount = 0;
      for (const order of legacyOrders) {
        let mappedStatus = "PLACED";
        if (order.status === "Food Processing") {
          mappedStatus = "PLACED";
        } else if (order.status === "Confirmed") {
          mappedStatus = "ACCEPTED";
        } else if (order.status === "Cancelled") {
          mappedStatus = "CANCELLED";
        } else if (order.status === "Delivered") {
          mappedStatus = "DELIVERED";
        } else {
          mappedStatus = "PLACED";
        }

        order.restaurant = rest._id;
        order.status = mappedStatus;
        await order.save();

        // Create OrderStatusHistory for migrated order
        const history = new orderStatusHistoryModel({
          order: order._id,
          status: mappedStatus,
          updatedBy: order.user || defaultVendor._id,
        });
        await history.save();

        migratedCount++;
      }
      console.log(`Auto-migration of orders completed! Migrated ${migratedCount} orders.`);
    }
  } catch (error) {
    console.error("MongoDB connection / migration error:", error);
    process.exit(1); // Exit with failure
  }
};
export default connectDB;