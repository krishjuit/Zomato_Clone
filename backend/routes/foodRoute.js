import express from "express";
import { addFood, listfood, getFoodById, updateFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import authMiddleware from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import validateObjectId from "../middleware/validateObjectId.js";

const foodRouter = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "food_images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

foodRouter.post("/add", authMiddleware, roleAuth(["vendor"]), upload.single("image"), addFood);
foodRouter.post("/remove/:id", authMiddleware, roleAuth(["vendor"]), validateObjectId, removeFood);
foodRouter.put("/update/:id", authMiddleware, roleAuth(["vendor"]), upload.single("image"), validateObjectId, updateFood);
foodRouter.get("/list", listfood);
foodRouter.get("/:id", validateObjectId, getFoodById);

export default foodRouter;