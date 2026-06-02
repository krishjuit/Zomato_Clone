import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import axios from "axios";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);

  // Paginated menu states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch restaurant profile details
  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(`${url}/api/restaurant/${id}`);
      if (response.data.success) {
        setRestaurant(response.data.restaurant);
      }
    } catch (error) {
      console.error("Fetch Restaurant Details Error:", error);
    }
  };

  // Fetch restaurant menu dishes
  const fetchRestaurantMenu = async (pageNum) => {
    setMenuLoading(true);
    try {
      const response = await axios.get(
        `${url}/api/restaurant/${id}/menu?page=${pageNum}&limit=8`
      );
      if (response.data.success) {
        setMenu(response.data.menu);
        setPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Fetch Restaurant Menu Error:", error);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([fetchRestaurantDetails(), fetchRestaurantMenu(1)]);
      setLoading(false);
    };
    loadAllData();
  }, [id]);

  // Stable mock rating generator based on restaurant name
  const getMockRating = (name) => {
    if (!name) return { rating: "4.2", reviews: 100 };
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = ((sum % 11) * 0.1 + 4.0).toFixed(1);
    const reviews = (sum % 200) + 45;
    return { rating, reviews };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#ef4f5f] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-700">Restaurant Not Found</h2>
        <p className="text-gray-400 text-sm">
          The restaurant profile you are trying to view does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-[#ef4f5f] text-white font-bold rounded-xl text-sm transition hover:bg-[#d83c4b] shadow-md"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const { rating, reviews } = getMockRating(restaurant.name);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-bold transition"
      >
        &larr; Back to all restaurants
      </button>

      {/* Immersive Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg h-[320px] md:h-[400px]">
        {/* Banner image */}
        <img
          src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 flex flex-col justify-end p-6 md:p-10 text-white">
          <div className="max-w-3xl space-y-4">
            
            {/* Status & Rating line */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${
                  restaurant.isActive
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-white/10 text-white/80 border-white/25"
                }`}
              >
                {restaurant.isActive ? "● Open Now" : "Closed"}
              </span>

              <div className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 border border-white/20">
                <span className="text-amber-400">★</span>
                <span>{rating}</span>
                <span className="text-white/60 font-semibold">({reviews} reviews)</span>
              </div>
            </div>

            {/* Restaurant Meta */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                {restaurant.name}
              </h1>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed font-medium">
                {restaurant.description || "Indulge in delicious cuisines crafted with the finest local ingredients."}
              </p>
            </div>

            {/* Cuisines & Address info */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-gray-300">
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1 text-gray-200">
                <svg
                  className="w-4 h-4 text-[#ef4f5f]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{restaurant.address}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Menu Header */}
      <div className="pt-6 border-t border-gray-100">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-gray-800">
            Order Food Online
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Select items from the restaurant's signature menu
          </p>
        </div>

        {menuLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-[#ef4f5f] rounded-full animate-spin"></div>
          </div>
        ) : menu.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-gray-100 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-gray-600">Menu is empty</h3>
            <p className="text-gray-400 text-sm mt-1">
              There are currently no food items available for this restaurant. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {menu.map((item) => (
                <FoodItem
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  image={item.image}
                  price={item.price}
                  description={item.description}
                  category={item.category}
                />
              ))}
            </div>

            {/* Menu Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-6 border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => fetchRestaurantMenu(page - 1)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                    page === 1
                      ? "text-gray-300 border-gray-100 cursor-not-allowed"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  &larr; Prev
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchRestaurantMenu(pageNum)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition flex items-center justify-center ${
                          page === pageNum
                            ? "bg-[#ef4f5f] text-white shadow-md"
                            : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => fetchRestaurantMenu(page + 1)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                    page === totalPages
                      ? "text-gray-300 border-gray-100 cursor-not-allowed"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;
