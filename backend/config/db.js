import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import restaurantModel from "../models/restaurantModel.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");

    // Auto-migration for legacy foods
    const orphanedFoodsCount = await foodModel.countDocuments({ restaurant: { $exists: false } });
    if (orphanedFoodsCount > 0) {
      console.log(`Found ${orphanedFoodsCount} legacy food items without a restaurant reference. Starting auto-migration...`);

      // Find or create default vendor
      let defaultVendor = await userModel.findOne({ email: "default_vendor@zomato.com" });
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

      // Find or create default restaurant
      let defaultRestaurant = await restaurantModel.findOne({ owner: defaultVendor._id });
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

      // Assign foods
      const updateResult = await foodModel.updateMany(
        { restaurant: { $exists: false } },
        { $set: { restaurant: defaultRestaurant._id } }
      );
      console.log(`Auto-migration completed successfully! Assigned ${updateResult.modifiedCount} items to Default Kitchen.`);
    }
  } catch (error) {
    console.error("MongoDB connection / migration error:", error);
    process.exit(1); // Exit with failure
  }
};
export default connectDB;