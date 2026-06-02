import couponModel from "../models/couponModel.js";
import restaurantModel from "../models/restaurantModel.js";

// Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      restaurant,
      isGlobal,
      expiryDate,
      usageLimit,
    } = req.body;

    const creatorId = req.userId;
    const creatorRole = req.userRole;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Code, discount value, and expiry date are required.",
      });
    }

    let finalRestaurantId = null;
    let finalIsGlobal = false;

    if (creatorRole === "vendor") {
      // Find vendor's restaurant
      const vendorRest = await restaurantModel.findOne({ owner: creatorId });
      if (!vendorRest) {
        return res.status(404).json({
          success: false,
          message: "Restaurant profile not found for this vendor. Create one first.",
        });
      }
      finalRestaurantId = vendorRest._id;
      finalIsGlobal = false;
    } else if (creatorRole === "superadmin") {
      finalIsGlobal = isGlobal === true || isGlobal === "true";
      if (!finalIsGlobal) {
        if (!restaurant) {
          return res.status(400).json({
            success: false,
            message: "Restaurant ID is required for non-global coupons.",
          });
        }
        finalRestaurantId = restaurant;
      }
    }

    // Check if code is unique
    const uppercaseCode = code.trim().toUpperCase();
    const existing = await couponModel.findOne({ code: uppercaseCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${uppercaseCode}" already exists.`,
      });
    }

    const newCoupon = new couponModel({
      code: uppercaseCode,
      description,
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscount: Number(maximumDiscount) || 0,
      restaurant: finalRestaurantId,
      createdBy: creatorId,
      isGlobal: finalIsGlobal,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit !== undefined ? Number(usageLimit) : 999999,
    });

    await newCoupon.save();

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Create Coupon Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      isActive,
      expiryDate,
      usageLimit,
    } = req.body;

    const coupon = await couponModel.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // Validate ownership
    if (req.userRole !== "superadmin") {
      const vendorRest = await restaurantModel.findOne({ owner: req.userId });
      if (!vendorRest || coupon.restaurant.toString() !== vendorRest._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You do not own the restaurant associated with this coupon.",
        });
      }
    }

    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = Number(minimumOrderAmount);
    if (maximumDiscount !== undefined) coupon.maximumDiscount = Number(maximumDiscount);
    if (isActive !== undefined) coupon.isActive = isActive;
    if (expiryDate !== undefined) coupon.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Update Coupon Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await couponModel.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // Validate ownership
    if (req.userRole !== "superadmin") {
      const vendorRest = await restaurantModel.findOne({ owner: req.userId });
      if (!vendorRest || coupon.restaurant.toString() !== vendorRest._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You do not own the restaurant associated with this coupon.",
        });
      }
    }

    await couponModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// List Coupons
export const listCoupons = async (req, res) => {
  try {
    const role = req.userRole;
    let query = {};

    if (role === "vendor") {
      const vendorRest = await restaurantModel.findOne({ owner: req.userId });
      if (!vendorRest) {
        return res.status(200).json({ success: true, coupons: [] });
      }
      query = { restaurant: vendorRest._id };
    } else if (role === "customer") {
      // Customers see active non-expired coupons for their restaurant plus global coupons
      const { restaurantId } = req.query;
      const today = new Date();

      query = {
        isActive: true,
        expiryDate: { $gt: today },
        $expr: { $lt: ["$usedCount", "$usageLimit"] },
      };

      if (restaurantId) {
        query.$or = [
          { isGlobal: true },
          { restaurant: restaurantId }
        ];
      } else {
        query.isGlobal = true;
      }
    }

    // Superadmins list all by default
    const coupons = await couponModel
      .find(query)
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("List Coupons Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Validate Coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, amount, restaurantId } = req.body;

    if (!code || !amount) {
      return res.status(400).json({
        success: false,
        message: "Code and order amount are required.",
      });
    }

    const uppercaseCode = code.trim().toUpperCase();
    const coupon = await couponModel.findOne({ code: uppercaseCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code.",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "This coupon is no longer active.",
      });
    }

    const today = new Date();
    if (new Date(coupon.expiryDate) <= today) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired.",
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This coupon has reached its usage limit.",
      });
    }

    // Check restaurant scope
    if (!coupon.isGlobal) {
      if (!restaurantId || coupon.restaurant.toString() !== restaurantId.toString()) {
        return res.status(400).json({
          success: false,
          message: "This coupon is not valid for this restaurant.",
        });
      }
    }

    // Check minimum order amount
    if (Number(amount) < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${coupon.minimumOrderAmount} is required to use this coupon.`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = Number(amount) * (coupon.discountValue / 100);
      if (coupon.maximumDiscount > 0 && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    }

    // Discount cannot exceed order amount
    if (discount > Number(amount)) {
      discount = Number(amount);
    }

    // Round discount to 2 decimal places
    discount = Math.round(discount * 100) / 100;

    return res.status(200).json({
      success: true,
      message: "Coupon validated successfully.",
      discount,
      couponCode: coupon.code,
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
