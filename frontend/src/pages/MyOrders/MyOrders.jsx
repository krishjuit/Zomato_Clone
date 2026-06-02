import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { url, token } = useContext(StoreContext);

  const getMyOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error(
        "Get My Orders Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getMyOrders();
    }
  }, [token]);

  // Helper to style status badges
  const getStatusStyle = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ACCEPTED":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "PREPARING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "READY":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper to format address
  const formatAddress = (address) => {
    if (!address) return "No Address Provided";
    if (typeof address === "string") return address;
    
    const { firstName, lastName, street, city, state, zip, phone } = address;
    const name = [firstName, lastName].filter(Boolean).join(" ");
    const details = [street, city, state, zip].filter(Boolean).join(", ");
    return (
      <div>
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-gray-600 text-xs mt-0.5">{details}</p>
        {phone && <p className="text-gray-500 text-xs mt-0.5">Phone: {phone}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and view your recent restaurant orders
          </p>
        </div>
        <button
          className="px-6 py-2.5 rounded-xl bg-[#ef4f5f] text-white hover:bg-[#d83c4b] transition font-bold shadow-md hover:shadow-lg text-sm flex items-center gap-2"
          onClick={getMyOrders}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17"
            />
          </svg>
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="animate-pulse bg-white border border-gray-150 rounded-3xl p-8 h-44 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#ef4f5f]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800">No orders placed yet</h3>
          <p className="text-gray-400 mt-1 max-w-sm mx-auto text-sm">
            Looks like you haven't ordered anything yet. Browse our top restaurants to find delicious food!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-gray-200 transition duration-300 overflow-hidden"
            >
              {/* Header Info */}
              <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-semibold text-gray-400">ORDER ID</span>
                    <span className="font-mono text-sm font-bold text-gray-700">#{order._id.slice(-6)}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(order.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="px-3.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-extrabold">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Restaurant & Food items */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 tracking-wider block uppercase">Restaurant</span>
                    <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">
                      {order.restaurant?.name || "Default Kitchen"}
                    </h3>
                    {order.restaurant?.address && (
                      <p className="text-xs text-gray-400 mt-0.5">{order.restaurant.address}</p>
                    )}
                  </div>

                  <div className="border-t border-gray-50 pt-4">
                    <span className="text-xs font-bold text-gray-400 tracking-wider block uppercase mb-2">Dishes</span>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm bg-gray-50/50 hover:bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100/50 transition duration-200"
                        >
                          <span className="text-gray-700 font-semibold">
                            {item.food?.name || "Dish (Deleted)"}
                          </span>
                          <span className="text-gray-500 font-bold bg-white px-2.5 py-0.5 rounded-lg border border-gray-100 text-xs">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delivery Address & Total Summary */}
                <div className="md:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 space-y-6">
                  <div>
                    <span className="text-xs font-bold text-gray-400 tracking-wider block uppercase mb-2">Delivery Details</span>
                    <div className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100/50">
                      {formatAddress(order.address)}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block uppercase">Paid Amount</span>
                      <p className="font-black text-2xl text-[#ef4f5f] mt-0.5">
                        ${order.amount}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-400 block uppercase">Payment Status</span>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                          order.payment
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {order.payment ? "PAID" : "PENDING"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;