import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import axios from "axios";

const SearchSkeleton = () => (
  <div className="animate-pulse bg-white rounded-3xl border border-gray-100 p-5 space-y-4 h-full flex flex-col justify-between">
    <div className="bg-gray-200 rounded-2xl h-44 w-full"></div>
    <div className="space-y-2">
      <div className="bg-gray-200 h-5 rounded w-2/3"></div>
      <div className="bg-gray-200 h-4 rounded w-4/5"></div>
    </div>
    <div className="space-y-3 pt-3 border-t border-gray-100 flex gap-2">
      <div className="bg-gray-200 h-4 rounded w-10"></div>
      <div className="bg-gray-200 h-4 rounded w-12"></div>
    </div>
  </div>
);

const Search = () => {
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);

  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active Filter States
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState("All");

  // Fetch search results from backend
  const fetchSearchResults = async (searchVal) => {
    if (!searchVal.trim()) {
      setRestaurants([]);
      setFoods([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${url}/api/restaurant/search?q=${encodeURIComponent(searchVal)}`
      );
      if (response.data.success) {
        setRestaurants(response.data.restaurants || []);
        setFoods(response.data.foods || []);
      }
    } catch (error) {
      console.error("Search API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // SEO mount hook
  useEffect(() => {
    document.title = "Search Cuisines & Restaurants - Zomato";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Find your favorite meals, cuisines, and local online dining spots on Zomato.');
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSearchResults(query);
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Extract all unique cuisines from matched restaurants/foods for dynamic filter pills
  const availableCuisines = React.useMemo(() => {
    const cuisines = new Set();
    restaurants.forEach((r) => r.cuisine.forEach((c) => cuisines.add(c)));
    foods.forEach((f) => {
      if (f.category) cuisines.add(f.category);
    });
    return ["All", ...Array.from(cuisines)];
  }, [restaurants, foods]);

  // Extract all unique restaurant names from matched foods for filtering
  const availableRestaurants = React.useMemo(() => {
    const list = new Set();
    foods.forEach((f) => {
      if (f.restaurant?.name) list.add(f.restaurant.name);
    });
    return ["All", ...Array.from(list)];
  }, [foods]);

  // Stable mock rating generator based on restaurant name
  const getMockRating = (name) => {
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = ((sum % 11) * 0.1 + 4.0).toFixed(1);
    const reviews = (sum % 200) + 45;
    return { rating, reviews };
  };

  // Filter restaurants locally
  const filteredRestaurants = restaurants.filter((r) => {
    if (selectedCuisine === "All") return true;
    return r.cuisine.some(
      (c) => c.toLowerCase() === selectedCuisine.toLowerCase()
    );
  });

  // Filter foods locally
  const filteredFoods = foods.filter((f) => {
    // Cuisine / Category filter
    if (selectedCuisine !== "All") {
      if (f.category?.toLowerCase() !== selectedCuisine.toLowerCase()) return false;
    }
    // Availability filter
    if (showAvailableOnly && !f.isAvailable) {
      return false;
    }
    // Restaurant filter
    if (selectedRestaurantFilter !== "All") {
      if (f.restaurant?.name !== selectedRestaurantFilter) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Search Input Box */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight text-center sm:text-left">
          Search Restaurants & Dishes
        </h1>
        
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type restaurant name, cuisine, or specific dishes..."
            className="w-full pl-14 pr-6 py-4.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]/20 focus:border-[#ef4f5f] transition-all"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>

        {/* Suggestion hints when query is empty */}
        {!query && (
          <p className="text-xs text-gray-400 text-center sm:text-left">
            Try searching for: <span className="font-semibold text-gray-500">Pizza, Pasta, Chinese, Default Kitchen</span>
          </p>
        )}
      </div>

      {/* Filters Toolbar (Shown only if query matches exist) */}
      {(restaurants.length > 0 || foods.length > 0) && (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Cuisine Pills */}
          <div className="space-y-2 flex-grow">
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Cuisine Filter</span>
            <div className="flex flex-wrap gap-2">
              {availableCuisines.slice(0, 8).map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedCuisine === cuisine
                      ? "bg-[#ef4f5f] text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Availability & Restaurant Dropdowns */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Restaurant Scope Dropdown */}
            {availableRestaurants.length > 2 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Restaurant Filter</span>
                <select
                  value={selectedRestaurantFilter}
                  onChange={(e) => setSelectedRestaurantFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 outline-none cursor-pointer"
                >
                  {availableRestaurants.map((rName) => (
                    <option key={rName} value={rName}>
                      {rName === "All" ? "All Restaurants" : rName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Availability Checkbox */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm cursor-pointer select-none">
              <input
                type="checkbox"
                id="availCheck"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-[#ef4f5f] focus:ring-[#ef4f5f]/20 border-gray-300 rounded"
              />
              <label htmlFor="availCheck" className="text-xs font-bold text-gray-600 cursor-pointer">
                Available Only
              </label>
            </div>

          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SearchSkeleton key={idx} />
          ))}
        </div>
      ) : !query ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 p-8 space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-2xl text-gray-400">
            🔎
          </div>
          <h3 className="text-xl font-bold text-gray-700">Type to start searching</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Discover menus and restaurant listings instantly.
          </p>
        </div>
      ) : filteredRestaurants.length === 0 && filteredFoods.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 p-8 space-y-2">
          <h3 className="text-xl font-bold text-gray-700">No results found for "{query}"</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Check the spelling or try searching for generic cuisine titles like "Chinese", "Sandwich", or "Cake".
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Matched Restaurants */}
          {filteredRestaurants.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                Matched Restaurants ({filteredRestaurants.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredRestaurants.map((restaurant) => {
                  const { rating, reviews } = getMockRating(restaurant.name);
                  return (
                    <div
                      key={restaurant._id}
                      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition duration-300 cursor-pointer flex flex-col h-full"
                    >
                      <div className="relative h-44 overflow-hidden bg-gray-100">
                        <img
                          src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span
                          className={`absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow border ${
                            restaurant.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {restaurant.isActive ? "● Open" : "Closed"}
                        </span>
                        <div className="absolute bottom-4 right-4 bg-white px-2 py-0.5 rounded-lg text-xs font-black text-gray-800 flex items-center gap-0.5 shadow">
                          <span className="text-amber-500">★</span>
                          <span>{rating}</span>
                        </div>
                      </div>

                      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="font-extrabold text-gray-800 group-hover:text-[#ef4f5f] transition line-clamp-1">
                            {restaurant.name}
                          </h3>
                          <p className="text-gray-400 text-[11px] line-clamp-1 mt-0.5">
                            {restaurant.address}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {restaurant.cuisine.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-50 text-gray-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Food Dishes */}
          {filteredFoods.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-gray-100">
              <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                Matched Food Dishes ({filteredFoods.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredFoods.map((item) => (
                  <div key={item._id} className="relative">
                    <FoodItem
                      id={item._id}
                      name={item.name}
                      image={item.image}
                      price={item.price}
                      description={item.description}
                      category={item.category}
                    />
                    
                    {/* Parent Restaurant Reference overlay */}
                    {item.restaurant?.name && (
                      <span
                        onClick={() => navigate(`/restaurant/${item.restaurant._id}`)}
                        className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-[10px] font-extrabold cursor-pointer border border-white/10 transition shadow-md"
                      >
                        From: {item.restaurant.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Search;
