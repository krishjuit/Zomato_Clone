import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import Footer from "../../components/Footer/Footer";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [category, setCategory] = useState("All");
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  // Paginated restaurant states
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch paginated restaurants from backend
  const fetchRestaurantsPage = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${url}/api/restaurant/list?page=${pageNum}&limit=8`
      );
      if (response.data.success) {
        setRestaurants(response.data.restaurants);
        setPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Fetch Paginated Restaurants Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantsPage(1);
  }, []);

  // Stable mock rating generator based on restaurant name
  const getMockRating = (name) => {
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = ((sum % 11) * 0.1 + 4.0).toFixed(1);
    const reviews = (sum % 200) + 45;
    return { rating, reviews };
  };

  // Filter restaurants based on ExploreMenu category selection
  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (category === "All") return true;
    return restaurant.cuisine.some(
      (c) => c.toLowerCase() === category.toLowerCase()
    );
  });

  return (
    <div className="space-y-6">
      <Header />
      
      {/* Explore Menu Section */}
      <ExploreMenu category={category} setCategory={setCategory} />

      {/* Featured Restaurants Section */}
      <div className="px-4 sm:px-8 lg:px-16 py-8" id="restaurants-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
              Top Restaurants Near You
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Explore authentic local flavors and high-quality meals delivered fast
            </p>
          </div>
          {category !== "All" && (
            <span className="bg-[#ef4f5f]/10 text-[#ef4f5f] border border-[#ef4f5f]/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Cuisine: {category}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-[#ef4f5f] rounded-full animate-spin"></div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-700">No matching restaurants found</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
              Try exploring another cuisine category or clear filters to view other restaurants.
            </p>
            {category !== "All" && (
              <button
                onClick={() => setCategory("All")}
                className="mt-4 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredRestaurants.map((restaurant) => {
                const { rating, reviews } = getMockRating(restaurant.name);
                return (
                  <div
                    key={restaurant._id}
                    onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                  >
                    {/* Image Block */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Active Status Badge */}
                      <span
                        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md border ${
                          restaurant.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {restaurant.isActive ? "● Open Now" : "Closed"}
                      </span>

                      {/* Rating Badge */}
                      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl text-xs font-black text-gray-800 flex items-center gap-1 shadow-md border border-gray-100">
                        <span className="text-amber-500">★</span>
                        <span>{rating}</span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-[#ef4f5f] transition duration-200 line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <p className="text-gray-400 text-xs line-clamp-2 min-h-[32px] leading-relaxed">
                          {restaurant.description || "Indulge in delicious cuisines crafted with the finest local ingredients."}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-50">
                        {/* Cuisine tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {restaurant.cuisine.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                          {restaurant.cuisine.length > 3 && (
                            <span className="bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              +{restaurant.cuisine.length - 3} More
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                          <span>{reviews} reviews</span>
                          <span className="text-[#ef4f5f] group-hover:translate-x-1 transition duration-200 flex items-center gap-0.5">
                            View Menu &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && category === "All" && (
              <div className="flex justify-center items-center gap-3 pt-6 border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => fetchRestaurantsPage(page - 1)}
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
                        onClick={() => fetchRestaurantsPage(pageNum)}
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
                  onClick={() => fetchRestaurantsPage(page + 1)}
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

      {/* Legacy Food Display Section (maintained for dish-browsing support) */}
      <div className="border-t border-gray-100 pt-8">
        <FoodDisplay category={category} />
      </div>

      <AppDownload />
      <Footer />
    </div>
  );
};

export default Home;