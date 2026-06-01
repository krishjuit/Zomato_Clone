import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  const { url, token } = useContext(StoreContext);

  const getMyOrders = async () => {
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
    }
  };

  useEffect(() => {
    if (token) {
      getMyOrders();
    }
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-500">
            No orders found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-md p-6 border"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg">
                    Order #{order._id.slice(-6)}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-xl text-[#ef4f5f]">
                    ${order.amount}
                  </p>

                  <p
                    className={`text-sm font-medium ${
                      order.payment
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.payment
                      ? "Payment Successful"
                      : "Payment Pending"}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t pt-4">
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                    {order.status}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                    {order.items.length} Items
                  </span>
                </div>

                <div className="mt-4">
                  <p className="font-medium">
                    Delivery Address
                  </p>

                  <p className="text-gray-600 text-sm mt-1">
                    {typeof order.address === "string"
                      ? order.address
                      : JSON.stringify(order.address)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  className="px-5 py-2 rounded-lg bg-[#ef4f5f] text-white hover:bg-[#d83c4b] transition"
                  onClick={getMyOrders}
                >
                  Refresh Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;