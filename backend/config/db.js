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
      const email = process.env.DEFAULT_VENDOR_EMAIL;
      const password = process.env.DEFAULT_VENDOR_PASSWORD;

      defaultVendor = await userModel.findOne({ email });
      if (!defaultVendor) {
        console.log("Creating default vendor account...");
        const hashedPassword = await bcrypt.hash(password, 10);
        defaultVendor = await userModel.create({
          name: "Default Vendor",
          email,
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

    // Ensure default vendor & restaurant exist on startup (bootstrap)
    await setupDefaultRestaurant();
    console.log("Default vendor ready:");
    console.log(`Email: ${process.env.DEFAULT_VENDOR_EMAIL}`);
    console.log("");
    console.log("Default restaurant ready:");
    console.log("Default Kitchen");
    console.log("");

    // Ensure at least one superadmin exists on startup (bootstrap check)
    const superadminExists = await userModel.findOne({ role: "superadmin" });
    if (!superadminExists) {
      console.log("No superadmin account found. Auto-creating first superadmin...");
      const superadminEmail = process.env.SUPERADMIN_EMAIL;
      const superadminPassword = process.env.SUPERADMIN_PASSWORD;
      
      const hashedSuperPassword = await bcrypt.hash(superadminPassword, 10);
      await userModel.create({
        name: "Super Admin",
        email: superadminEmail,
        password: hashedSuperPassword,
        role: "superadmin",
      });
      console.log("First superadmin created successfully:");
      console.log(`Email: ${superadminEmail}`);
      console.log("");
    } else {
      console.log("Superadmin account(s) present in database. Seeding skipped.");
    }

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