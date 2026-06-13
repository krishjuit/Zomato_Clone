import React from "react";
import { StoreContext } from "../../context/StoreContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    food_list,
    removeFromCart,
    addToCart,
    deleteFromCart,
    getTotalCartAmount,
    token,
    url,
    appliedCouponCode,
    couponDiscount,
    setAppliedCouponCode,
    setCouponDiscount,
    setShowLogin,
  } = React.useContext(StoreContext);

  const [couponInput, setCouponInput] = React.useState(appliedCouponCode || "");
  const [availableCoupons, setAvailableCoupons] = React.useState([]);
  const [couponsLoading, setCouponsLoading] = React.useState(false);

  const getCartRestaurantId = () => {
    for (const itemId in cartItems) {
      const itemInfo = food_list.find((food) => food._id === itemId);
      if (itemInfo && itemInfo.restaurant) {
        return itemInfo.restaurant._id || itemInfo.restaurant;
      }
    }
    return null;
  };

  const fetchAvailableCoupons = async () => {
    const restaurantId = getCartRestaurantId();
    if (!restaurantId) {
      setAvailableCoupons([]);
      return;
    }
    setCouponsLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${url}/api/coupon/list?restaurantId=${restaurantId}`,
        { headers }
      );
      if (response.data.success) {
        setAvailableCoupons(response.data.coupons || []);
      }
    } catch (error) {
      console.error("Fetch available coupons error:", error);
    } finally {
      setCouponsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAvailableCoupons();
  }, [cartItems, token]);

  const applyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }
    const totalAmount = getTotalCartAmount();
    if (totalAmount === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const restaurantId = getCartRestaurantId();

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        `${url}/api/coupon/validate`,
        { code, amount: totalAmount, restaurantId },
        { headers }
      );

      if (response.data.success) {
        setCouponDiscount(response.data.discount);
        setAppliedCouponCode(response.data.couponCode);
        setCouponInput(response.data.couponCode);
        toast.success(`Coupon applied! Saved $${response.data.discount}`);
      }
    } catch (error) {
      console.error("Validate coupon error:", error);
      setCouponDiscount(0);
      setAppliedCouponCode("");
      toast.error(error.response?.data?.message || "Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setAppliedCouponCode("");
    setCouponInput("");
    toast.info("Coupon removed");
  };

  const handleProceedToCheckout = () => {
    if (!token) {
      toast.error("Please login to proceed to checkout!");
      setShowLogin(true);
    } else {
      navigate('/order');
    }
  };

  const totalAmount = getTotalCartAmount();

  const discountAmount = couponDiscount;
  const finalTotal = totalAmount - discountAmount + 5;

  const hasItems = Object.keys(cartItems).length > 0;

  return (
    <div className="px-4 sm:px-8 lg:px-16 py-12 min-h-screen bg-gray-50">

      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Your Cart
        </h1>
        <p className="text-gray-500">
          Review your selected delicious meals.
        </p>
      </div>

      {/* Empty Cart */}
      {!hasItems ? (
        <div className="bg-white rounded-3xl p-12 shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-3">
            Your cart is empty 🛒
          </h2>
          <p className="text-gray-500">
            Add some delicious food to continue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT: CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">

            {Object.keys(cartItems).map((itemId) => {
              const item = food_list.find((food) => food._id === itemId);
              if (!item) return null;

              return (
                <div
                  key={itemId}
                  className="bg-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row gap-5 items-center"
                >

                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded-2xl"
                  />

                  {/* Details */}
                  <div className="flex-1 w-full">

                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {item.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.category}
                        </p>
                      </div>

                      <span className="text-xl font-bold text-[#ef4f5f]">
                        ${item.price}
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-6">

                      <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-xl">

                        <button
                          onClick={() => removeFromCart(itemId)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#ef4f5f] text-xl font-bold shadow"
                        >
                          -
                        </button>

                        <span className="text-lg font-semibold text-gray-700 min-w-[20px] text-center">
                          {cartItems[itemId]}
                        </span>

                        <button
                          onClick={() => addToCart(itemId)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#ef4f5f] text-white text-xl font-bold shadow"
                        >
                          +
                        </button>

                      </div>

                      <button
                        onClick={() => deleteFromCart(itemId)}
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: SUMMARY CARD */}
          <div className="bg-white rounded-3xl shadow-md p-8 h-fit sticky top-28">

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Order Summary
            </h2>

            {/* Coupon */}
            <div className="mb-6 space-y-3">
              <p className="text-sm font-medium text-gray-600">
                Have a coupon?
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#ef4f5f] text-sm uppercase font-bold"
                />

                <button
                  onClick={() => applyCoupon()}
                  className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-black font-semibold text-sm transition"
                >
                  Apply
                </button>
              </div>

              {couponDiscount > 0 && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 font-bold">
                  <span>Coupon "{appliedCouponCode}" Applied 🎉</span>
                  <button
                    onClick={removeCoupon}
                    type="button"
                    className="text-[#ef4f5f] hover:underline font-black cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Available Coupons Component */}
            {hasItems && (
              <div className="mb-6 border-t pt-4">
                <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🏷️</span> Available Coupons
                </h3>
                {couponsLoading ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
                    <div className="w-3.5 h-3.5 border-2 border-[#ef4f5f] border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking for deals...</span>
                  </div>
                ) : availableCoupons.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No coupons available for this restaurant.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {availableCoupons.map((c) => {
                      const isSelected = appliedCouponCode === c.code;
                      return (
                        <div
                          key={c._id}
                          onClick={() => !isSelected && applyCoupon(c.code)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left flex justify-between items-center ${
                            isSelected
                              ? "bg-rose-50 border-rose-200 shadow-sm"
                              : "bg-gray-50/50 hover:bg-rose-50/30 border-gray-100 hover:border-rose-100"
                          }`}
                        >
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[10px] text-[#ef4f5f] bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md tracking-wide uppercase">
                                {c.code}
                              </span>
                              {c.isGlobal && (
                                <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded uppercase tracking-wider">
                                  Global
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-gray-700">
                              {c.description || `Save ${c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`} on your order`}
                            </p>
                            {c.minimumOrderAmount > 0 && (
                              <p className="text-[9px] text-gray-400 font-semibold">
                                Min. order: ${c.minimumOrderAmount}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all ${
                              isSelected
                                ? "bg-rose-100 text-[#ef4f5f] cursor-default"
                                : "bg-white text-gray-700 shadow-sm hover:bg-rose-50 border border-gray-200/80"
                            }`}
                            disabled={isSelected}
                          >
                            {isSelected ? "Applied" : "Apply"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-4 border-t pt-4">

              <div className="flex justify-between text-gray-600 text-sm font-semibold">
                <span>Subtotal</span>
                <span>${totalAmount}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 text-sm font-semibold">
                  <span>Coupon Discount ({appliedCouponCode})</span>
                  <span>-${couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 text-sm font-semibold">
                <span>Delivery Fee</span>
                <span>$5</span>
              </div>

              <div className="border-t pt-4 flex justify-between text-lg font-black text-gray-800">
                <span>Total</span>
                <span>${finalTotal}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button className="w-full mt-8 h-12 rounded-2xl bg-[#ef4f5f] text-white font-semibold hover:bg-[#d93b4b] hover:shadow-xl transition-all duration-300"
            onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;