import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount,token,food_list,cartItems,url } = React.useContext(StoreContext);

  const [data,setData]=React.useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    country:"",
    zip:"",
    phone:""
  }) 

  // const navigate=useNavigate();
  useEffect(() => {
    if (!token) {
      navigate("/cart");
    }
    else if(getTotalCartAmount() === 0){
      navigate("/cart");
    }
  }, [token]);

  const placeOrder = async (event) => {
  event.preventDefault();

  try {
    let orderItems = [];

    for (const itemId in cartItems) {
      const itemInfo = food_list.find(
        (food) => food._id === itemId
      );

      if (itemInfo) {
        orderItems.push({
          food: itemId,
          quantity: cartItems[itemId],
        });
      }
    }

    const orderData = {
      items: orderItems,
      address: data,
      totalAmount: getTotalCartAmount() + 5,
    };

    const response = await axios.post(
      `${url}/api/order/place`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = response.data;

    if (result.success) {
      window.location.assign(result.sessionUrl);
    } else {
      toast.error(result.message || "Failed to place order.");
      navigate("/cart");
    }

  } catch (error) {
    console.error(
      "Place Order Error:",
      error.response?.data || error.message
    );

    toast.error("Failed to place order");
    navigate("/cart");
  }
};

  const totalAmount = getTotalCartAmount();
  const deliveryFee = 5;
  const finalTotal = totalAmount + deliveryFee;

  return (
    <form className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10"
    onSubmit={placeOrder}>

      {/* LEFT - FORM */}
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">

        <h2 className="text-2xl font-bold text-gray-800">
          Delivery Information
        </h2>

        {/* Name */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
            required
            value={data.firstName}
            onChange={(e) => setData({...data, firstName: e.target.value})}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
            required
            value={data.lastName}
            onChange={(e) => setData({...data, lastName: e.target.value})}
          />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
          required
          value={data.email}
          onChange={(e) => setData({...data, email: e.target.value})}
        />

        {/* Street */}
        <input
          type="text"
          placeholder="Street"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
          value={data.street}
          onChange={(e) => setData({...data, street: e.target.value})}
        />

        {/* City / State */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="City"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
            value={data.city}
            onChange={(e) => setData({...data, city: e.target.value})}
          />
          <input
            type="text"
            placeholder="State"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
            value={data.state}
            onChange={(e) => setData({...data, state: e.target.value})}
          />
        </div>

        {/* Country */}
        <input
          type="text"
          placeholder="Country"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
          value={data.country}
          onChange={(e) => setData({...data, country: e.target.value})}
        />

        {/* Zip */}
        <input
          type="text"
          placeholder="Zip Code"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
          value={data.zip}
          onChange={(e) => setData({...data, zip: e.target.value})}
        />

        {/* Phone */}
        <input
          type="text"
          placeholder="Phone Number"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef4f5f]"
          value={data.phone}
          onChange={(e) => setData({...data, phone: e.target.value})}
        />
      </div>

      {/* RIGHT - SUMMARY */}
      <div className="bg-white p-6 rounded-2xl shadow-md h-fit sticky top-28">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Order Summary
        </h2>

        <div className="space-y-4 text-gray-600">

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${totalAmount}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>${deliveryFee}</span>
          </div>

          <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-800">
            <span>Total</span>
            <span>${finalTotal}</span>
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full mt-8 bg-[#ef4f5f] text-white py-3 rounded-xl font-semibold hover:bg-[#d93b4b] transition duration-200"
        >
          Proceed to Payment
        </button>
      </div>

    </form>
  );
};

export default PlaceOrder;