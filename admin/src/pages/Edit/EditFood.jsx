import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets, menu_list } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const EditFood = ({ url, token, role }) => {
  const { foodId } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    name: "",
    description: "",
    category: "Salad",
    price: "",
    isAvailable: true,
  });

  // Fetch Food Details
  const fetchFoodDetails = async () => {
    try {
      const response = await axios.get(`${url}/api/food/${foodId}`);
      if (response.data) {
        setData({
          name: response.data.name,
          description: response.data.description,
          category: response.data.category,
          price: response.data.price,
          isAvailable: response.data.isAvailable ?? true,
        });
        setCurrentImage(response.data.image);
      }
    } catch (error) {
      console.error("Fetch Food Details Error:", error);
      toast.error(error.response?.data?.message || "Failed to load food details");
      navigate("/list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFoodDetails();
    }
  }, [foodId, token]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("price", data.price);
      formData.append("isAvailable", data.isAvailable);
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.put(`${url}/api/food/update/${foodId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Food item updated successfully!");
        navigate("/list");
      } else {
        toast.error("Failed to update food item.");
      }
    } catch (error) {
      console.error("Update Food Error:", error);
      toast.error(error.response?.data?.message || "Failed to update food item.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#ef4f5f] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-3xl p-8">
        {/* Heading */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Edit Food Item
            </h2>
            <p className="text-gray-500 mt-2">
              Modify details for your food item on the menu.
            </p>
          </div>
          <button
            onClick={() => navigate("/list")}
            className="text-gray-500 hover:text-gray-800 font-semibold text-sm transition"
          >
            &larr; Back to List
          </button>
        </div>

        <form className="space-y-6" onSubmit={onSubmitHandler}>
          {/* Upload Image */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Upload Image (Leave empty to keep existing)
            </p>

            <label
              htmlFor="image"
              className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#ef4f5f] transition"
            >
              <img
                src={
                  image
                    ? URL.createObjectURL(image)
                    : currentImage || assets.upload_area
                }
                alt="upload"
                className="w-full h-full object-cover"
              />
            </label>

            <input
              type="file"
              id="image"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          {/* Food Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Food Name
            </label>
            <input
              type="text"
              placeholder="Enter food name"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Write food description..."
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
              required
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
            ></textarea>
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Category
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
                required
                value={data.category}
                onChange={(e) => setData({ ...data, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {menu_list.map((item, index) => (
                  <option key={index} value={item.menu_name}>
                    {item.menu_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Price
              </label>
              <input
                type="number"
                placeholder="$20"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
                value={data.price}
                onChange={(e) => setData({ ...data, price: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Availability Status */}
          <div className="flex items-center gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
            <input
              type="checkbox"
              id="isAvailable"
              className="w-5 h-5 accent-[#ef4f5f] cursor-pointer"
              checked={data.isAvailable}
              onChange={(e) => setData({ ...data, isAvailable: e.target.checked })}
            />
            <label htmlFor="isAvailable" className="font-semibold text-gray-700 cursor-pointer select-none">
              Item Available for Ordering
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#ef4f5f] hover:bg-[#d93b4b] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Update Food Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFood;
