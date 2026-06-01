import React, { useEffect, useState } from "react";
import axios from "axios";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${url}/api/order/allorders`
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error(
        "Fetch Orders Error:",
        error.response?.data || error.message
      );
    }
  };

  const updateOrderStatus = async (
    orderId,
    status
  ) => {
    try {
      const response = await axios.post(
        `${url}/api/order/updatestatus`,
        {
          orderId,
          status,
        }
      );
      console.log(response.data);

      if (response.data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error(
        "Update Status Error:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl shadow p-5 border"
          >
            <div className="flex justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-bold">
                  Order #{order._id.slice(-6)}
                </h2>

                <p className="text-gray-500 text-sm">
                  {new Date(
                    order.createdAt
                  ).toLocaleString()}
                </p>

                <p className="mt-2">
                  <strong>Amount:</strong> $
                  {order.amount}
                </p>

                <p>
                  <strong>Payment:</strong>{" "}
                  {order.payment
                    ? "Paid"
                    : "Pending"}
                </p>
              </div>

              <div>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(
                      order._id,
                      e.target.value
                    )
                  }
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Confirmed">
                    Confirmed
                  </option>

                  <option value="Preparing">
                    Preparing
                  </option>

                  <option value="Out for Delivery">
                    Out for Delivery
                  </option>

                  <option value="Delivered">
                    Delivered
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">
                Ordered Items
              </h3>

              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between text-sm py-1"
                >
                  <span>
                    {item.food?.name}
                  </span>

                  <span>
                    Qty: {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">
                Delivery Address
              </h3>

              <p className="text-sm text-gray-600">
                {typeof order.address ===
                "object"
                  ? `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}`
                  : order.address}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;