import mongoose from "mongoose";

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: "${id}" is not a valid MongoDB ObjectId`,
    });
  }
  next();
};

export default validateObjectId;
