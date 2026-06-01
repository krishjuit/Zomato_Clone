import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from "react-toastify"; 
const List = ({ url, token, role }) => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  };

  // Fetch Food Items
  const fetchList = async () => {
    try {
      let endpoint = `${url}/api/food/list`;

      if (role === "vendor") {
        const decoded = decodeToken(token);
        if (decoded) {
          // Fetch restaurants list to find vendor's restaurant ID
          const resResponse = await axios.get(`${url}/api/restaurant/list`);
          if (resResponse.data.success) {
            const myRestaurant = resResponse.data.restaurants.find(
              (r) => r.owner && r.owner._id === decoded.userId
            );
            if (myRestaurant) {
              endpoint = `${url}/api/food/list?restaurantId=${myRestaurant._id}`;
            } else {
              setList([]);
              return;
            }
          }
        }
      }

      const response = await axios.get(endpoint);

      if (Array.isArray(response.data)) {
        setList(response.data);
      } else if (Array.isArray(response.data.data)) {
        setList(response.data.data);
      } else if (Array.isArray(response.data.foods)) {
        setList(response.data.foods);
      } else {
        setList([]);
      }
    } catch (error) {
      console.error("Error Fetching Food List:", error);
      toast.error("Failed to fetch food items.");
    }
  };

  // Delete Food Item
  const removeFood = async (foodId) => {
    try {
      await axios.post(
        `${url}/api/food/remove/${foodId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Food Deleted Successfully");
      fetchList();
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(error.response?.data?.message || "Failed to delete food item.");
    }
  };

  // Edit Food Item
  const editFood = (foodId) => {
    navigate(`/edit/${foodId}`);
  };

  useEffect(() => {
    if (token) {
      fetchList();
    }
  }, [token]);

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-3 sm:p-5 md:p-8">

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">

          <div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Food Dashboard
            </h1>

            <p className="text-sm sm:text-base text-gray-500 mt-1">
              View, edit and manage your food items
            </p>

          </div>

          <button
            onClick={() => navigate('/add')}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow-md"
          >
            + Add Food
          </button>

        </div>

        {/* Empty State */}
        {list.length === 0 ? (

          <div className="flex flex-col items-center justify-center py-16">

            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
              No Food Items Found
            </h2>

            <p className="text-sm sm:text-base text-gray-400 mt-2 text-center">
              Add food items to display them here.
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {list?.map((item, index) => (

              <div
                key={item._id || index}
                className="bg-gray-50 hover:bg-gray-100 rounded-2xl shadow-md p-4 transition-all duration-300"
              >

                <div className="flex flex-col lg:flex-row gap-5 lg:items-center">

                  {/* Image */}
                  <div className="flex justify-center lg:justify-start">

                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full max-w-[220px] h-52 sm:h-60 lg:w-32 lg:h-32 object-cover rounded-xl border"
                    />

                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">

                    {/* Name */}
                    <div>

                      <h2 className="text-xl font-bold text-gray-800">
                        {item.name}
                      </h2>

                      <p className="text-gray-500 text-sm mt-1">
                        {item.description
                          ? item.description.slice(0, 120) + "..."
                          : "No Description"}
                      </p>

                    </div>

                    {/* Category + Price */}
                    <div className="flex flex-wrap gap-3 items-center">

                      <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
                        {item.category}
                      </span>

                      <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold">
                        ${item.price}
                      </span>

                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">

                    <button
                      onClick={() => editFood(item._id)}
                      className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-white px-5 py-2 rounded-xl font-medium transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => removeFood(item._id)}
                      className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-medium transition"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  )
}

export default List