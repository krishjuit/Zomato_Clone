import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },

    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "food",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    amount: {
      type: Number,
      required: true,
    },

    address: {
      firstName: String,
      lastName: String,
      email: String,
      street: String,
      city: String,
      state: String,
      country: String,
      zip: String,
      phone: String,
    },

    status: {
      type: String,
      enum: [
        "PLACED",
        "ACCEPTED",
        "REJECTED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED"
      ],
      default: "PLACED",
    },

    payment: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const orderModel =mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;