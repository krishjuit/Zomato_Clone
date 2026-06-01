import mongoose from "mongoose";

const orderStatusHistorySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
);

const orderStatusHistoryModel =
  mongoose.models.orderStatusHistory || mongoose.model("orderStatusHistory", orderStatusHistorySchema);

export default orderStatusHistoryModel;
