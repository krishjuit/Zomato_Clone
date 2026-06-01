import React, { useEffect, useState } from "react";
import { assets, menu_list } from "../../assets/assets";

import axios from "axios";
import { toast } from "react-toastify";
const Add = ({ url, token, role }) => {
  const [image, setImage] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [data, setData] = useState({
    name: "",
    description: "",
    category: "Salad",
    price: ""
  });

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${url}/api/restaurant/list`);
      if (response.data.success) {
        setRestaurants(response.data.restaurants || []);
        if (response.data.restaurants.length > 0) {
          setSelectedRestaurant(response.data.restaurants[0]._id);
        }
      }
    } catch (error) {
      console.error("Fetch Restaurants Error:", error);
      toast.error("Failed to load restaurant profiles.");
    }
  };

  useEffect(() => {
    if (role === "superadmin") {
      fetchRestaurants();
    }
  }, [role]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (role === "superadmin" && !selectedRestaurant) {
      toast.error("Please select a restaurant first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("price", data.price);
      formData.append("image", image);
      if (role === "superadmin") {
        formData.append("restaurantId", selectedRestaurant);
      }

      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        setData({
          name: "",
          description: "",
          category: "Salad",
          price: ""
        });
        setImage(null);
        toast.success("Food item added successfully!");
      } else {
        toast.error("Failed to add food item. Please try again.");
      }
    } catch (error) {
      console.error("Add Food Item Error:", error);
      toast.error(error.response?.data?.message || "Failed to add food item. Please try again.");
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-3xl p-8">
        
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Add New Food Item
          </h2>
          <p className="text-gray-500 mt-2">
            Fill in the details to add a new food item to your menu.
          </p>
        </div>

        <form className="space-y-6" onSubmit={onSubmitHandler}>
          {/* Superadmin Restaurant Select */}
          {role === "superadmin" && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Assign to Restaurant
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f] bg-white"
                required
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
              >
                <option value="">Select Restaurant</option>
                {restaurants.map((res) => (
                  <option key={res._id} value={res._id}>
                    {res.name} ({res.owner?.name || "No Owner"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Upload Image */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Upload Image
            </p>

            <label
              htmlFor="image"
              className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#ef4f5f] transition"
            >
              <img
                src={
                  image
                    ? URL.createObjectURL(image)
                    : assets.upload_area
                }
                alt="upload"
                className="w-full h-full object-cover"
              />
            </label>

            <input
              type="file"
              id="image"
              hidden
              required
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
              rows="5"
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#ef4f5f] hover:bg-[#d93b4b] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Add Food Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;