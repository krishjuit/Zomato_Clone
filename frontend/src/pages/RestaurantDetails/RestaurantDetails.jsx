import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import axios from "axios";
import { toast } from "react-toastify";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url, token } = useContext(StoreContext);

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  
  // Tab control: menu vs reviews
  const [activeTab, setActiveTab] = useState("menu");

  // Paginated menu states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reviews states
  const [reviewsList, setReviewsList] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Review Form state
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState(""); // "" means review restaurant only
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState("");

  // Fetch restaurant details
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

  // Fetch restaurant menu
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

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${url}/api/review/restaurant/${id}`);
      if (response.data.success) {
        setReviewsList(response.data.reviews || []);
      }
    } catch (error) {
      console.error("Fetch Reviews Error:", error);
    }
  };

  // Check customer eligibility (has completed/delivered order from this restaurant)
  const checkReviewEligibility = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        // Filter delivered orders from this restaurant
        const matching = response.data.orders.filter(
          (o) => o.restaurant?._id === id && o.status === "DELIVERED"
        );
        setEligibleOrders(matching);
        if (matching.length > 0) {
          setSelectedOrderId(matching[0]._id);
        }
      }
    } catch (error) {
      console.error("Check Eligibility Error:", error);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRestaurantDetails(),
        fetchRestaurantMenu(1),
        fetchReviews(),
        checkReviewEligibility(),
      ]);
      setLoading(false);
    };
    loadAllData();
  }, [id, token]);

  // Handle Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !formText.trim()) {
      toast.error("Please select an order and type your review comment.");
      return;
    }

    setReviewLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        restaurantId: id,
        orderId: selectedOrderId,
        foodId: selectedFoodId || null,
        rating: formRating,
        review: formText,
      };

      const response = await axios.post(`${url}/api/review/create`, payload, {
        headers,
      });

      if (response.data.success) {
        toast.success("Review submitted successfully!");
        setFormText("");
        setSelectedFoodId("");
        
        // Reload reviews & stats
        await fetchReviews();
        await fetchRestaurantDetails();
        await checkReviewEligibility();
      }
    } catch (error) {
      console.error("Submit Review Error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Find eligible foods for the currently selected order in form
  const currentOrderFoods = React.useMemo(() => {
    if (!selectedOrderId) return [];
    const ord = eligibleOrders.find((o) => o._id === selectedOrderId);
    return ord ? ord.items : [];
  }, [selectedOrderId, eligibleOrders]);

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
          The restaurant profile you are trying to view does not exist.
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

  const ratingVal = restaurant.averageRating > 0 ? restaurant.averageRating.toFixed(1) : "0.0";
  const reviewsCount = restaurant.ratingCount || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-bold transition"
      >
        &larr; Back to all restaurants
      </button>

      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg h-[320px] md:h-[400px]">
        <img
          src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 flex flex-col justify-end p-6 md:p-10 text-white">
          <div className="max-w-3xl space-y-4">
            
            {/* Status & Rating */}
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
                <span>{ratingVal}</span>
                <span className="text-white/60 font-semibold">({reviewsCount} reviews)</span>
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

            {/* Cuisines & Address */}
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

      {/* Tabs Row */}
      <div className="flex gap-4 border-b border-gray-100 pb-4">
        <button
          onClick={() => setActiveTab("menu")}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === "menu"
              ? "bg-[#ef4f5f] text-white shadow"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}
        >
          Explore Menu
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === "reviews"
              ? "bg-[#ef4f5f] text-white shadow"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}
        >
          Customer Reviews ({reviewsList.length})
        </button>
      </div>

      {/* Tab Panel: Menu */}
      {activeTab === "menu" && (
        <div>
          {menuLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-[#ef4f5f] rounded-full animate-spin"></div>
            </div>
          ) : menu.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border border-gray-100 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-gray-600">Menu is empty</h3>
              <p className="text-gray-400 text-sm mt-1">
                There are currently no food items available for this restaurant.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {menu.map((item) => (
                  <div key={item._id} className="relative">
                    <FoodItem
                      id={item._id}
                      name={item.name}
                      image={item.image}
                      price={item.price}
                      description={item.description}
                      category={item.category}
                    />
                    
                    {/* Real food rating badge if rated */}
                    {item.averageRating > 0 && (
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-gray-800 px-2 py-0.5 rounded-lg text-[10px] font-black border border-gray-100 shadow flex items-center gap-0.5">
                        <span className="text-amber-500">★</span>
                        <span>{item.averageRating.toFixed(1)}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Menu Pagination */}
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
      )}

      {/* Tab Panel: Reviews */}
      {activeTab === "reviews" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Reviews list */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-extrabold text-gray-800">
              Customer Feedbacks
            </h2>

            {reviewsList.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 border rounded-3xl p-8">
                <p className="text-gray-400 text-sm">No reviews submitted yet for this restaurant.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-gray-800 text-sm">
                          {rev.user?.name || "Anonymous Customer"}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold block">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <span className="bg-amber-50 border border-amber-100 text-amber-700 font-black px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-0.5 shadow-sm">
                        ★ {rev.rating}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {rev.review}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Panel (Shown only to eligible customers) */}
          <div className="lg:col-span-5 bg-gray-50 rounded-3xl border border-gray-200/50 p-6 shadow-inner space-y-5">
            <div>
              <h3 className="font-extrabold text-gray-800 text-lg">
                Submit a Review
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Share your ordering experience with other diners
              </p>
            </div>

            {token ? (
              eligibleOrders.length === 0 ? (
                <div className="bg-white/60 p-5 rounded-2xl border border-gray-100 text-center space-y-2">
                  <p className="text-xs text-gray-500 font-medium">
                    No eligible orders found for review.
                  </p>
                  <p className="text-[10px] text-gray-400">
                    To write a review, you must first complete and receive an order from this restaurant.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Select Order */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Select Order
                    </label>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none cursor-pointer focus:border-[#ef4f5f]"
                    >
                      {eligibleOrders.map((o) => (
                        <option key={o._id} value={o._id}>
                          Order #{o._id.slice(-6)} - {new Date(o.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Dish (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Dish to Review (Optional)
                    </label>
                    <select
                      value={selectedFoodId}
                      onChange={(e) => setSelectedFoodId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none cursor-pointer focus:border-[#ef4f5f]"
                    >
                      <option value="">Just Review Restaurant Profile</option>
                      {currentOrderFoods.map((item, idx) => (
                        <option key={idx} value={item.food?._id || ""}>
                          {item.food?.name || "Dish (Deleted)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Rating */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Score Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setFormRating(num)}
                          className={`w-9 h-9 rounded-xl text-sm font-black transition flex items-center justify-center ${
                            formRating >= num
                              ? "bg-amber-500 text-white shadow-sm"
                              : "bg-white border border-gray-200 text-gray-400"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Comments / Review text
                    </label>
                    <textarea
                      rows="4"
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="Tell us about the delivery, packaging, or dish taste..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#ef4f5f]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full py-3 rounded-xl bg-[#ef4f5f] text-white hover:bg-[#d83c4b] font-bold text-xs shadow-md transition"
                  >
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )
            ) : (
              <div className="bg-white/60 p-5 rounded-2xl border border-gray-100 text-center space-y-3">
                <p className="text-xs text-gray-500 font-medium">
                  Log in to submit a review.
                </p>
                <p className="text-[10px] text-gray-400">
                  Reviews are verified and restricted to registered customers only.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;
