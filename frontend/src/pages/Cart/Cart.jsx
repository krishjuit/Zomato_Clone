import React from "react";
import { StoreContext } from "../../context/StoreContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Cart = () => {
  const [coupon, setCoupon] = React.useState("");
  const [discount, setDiscount] = React.useState(0);
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
  } = React.useContext(StoreContext);

  const getCartRestaurantId = () => {
    for (const itemId in cartItems) {
      const itemInfo = food_list.find((food) => food._id === itemId);
      if (itemInfo && itemInfo.restaurant) {
        return itemInfo.restaurant._id || itemInfo.restaurant;
      }
    }
    return null;
  };

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
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
        setDiscount(response.data.discount);
        toast.success(`Coupon applied! Saved $${response.data.discount}`);
      }
    } catch (error) {
      console.error("Validate coupon error:", error);
      setDiscount(0);
      toast.error(error.response?.data?.message || "Invalid coupon code");
    }
  };

  const totalAmount = getTotalCartAmount();

  const discountAmount = discount;
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
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#ef4f5f]"
                />

                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-black"
                >
                  Apply
                </button>
              </div>

              {discount > 0 && (
                <p className="text-green-600 text-sm font-medium">
                  {discount}% discount applied 🎉
                </p>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-4">

              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${totalAmount}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{discount}%</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>$5</span>
              </div>

              <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-800">
                <span>Total</span>
                <span>${finalTotal}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button className="w-full mt-8 h-12 rounded-2xl bg-[#ef4f5f] text-white font-semibold hover:bg-[#d93b4b] hover:shadow-xl transition-all duration-300"
            onClick={()=>navigate('/order')}>
              Proceed to Checkout
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;