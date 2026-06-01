import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = ({ url, token, role }) => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // pending, active, history
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let fetchedOrders = [];
      const headers = { Authorization: `Bearer ${token}` };

      if (role === "vendor") {
        if (activeTab === "pending") {
          const response = await axios.get(`${url}/api/order/vendor/pending`, { headers });
          if (response.data.success) {
            fetchedOrders = response.data.orders;
          }
        } else {
          const response = await axios.get(`${url}/api/order/vendor/history`, { headers });
          if (response.data.success) {
            const historyOrders = response.data.orders;
            if (activeTab === "active") {
              fetchedOrders = historyOrders.filter((o) =>
                ["ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(o.status)
              );
            } else if (activeTab === "history") {
              fetchedOrders = historyOrders.filter((o) =>
                ["DELIVERED", "CANCELLED", "REJECTED"].includes(o.status)
              );
            }
          }
        }
      } else if (role === "superadmin") {
        const response = await axios.get(`${url}/api/order/allorders`, { headers });
        if (response.data.success) {
          const allOrdersList = response.data.orders;
          if (activeTab === "pending") {
            fetchedOrders = allOrdersList.filter((o) => o.status === "PLACED");
          } else if (activeTab === "active") {
            fetchedOrders = allOrdersList.filter((o) =>
              ["ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(o.status)
            );
          } else if (activeTab === "history") {
            fetchedOrders = allOrdersList.filter((o) =>
              ["DELIVERED", "CANCELLED", "REJECTED"].includes(o.status)
            );
          }
        }
      }

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Fetch Orders Error:", error);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(`${url}/api/order/vendor/accept/${orderId}`, {}, { headers });
      if (response.data.success) {
        toast.success("Order accepted!");
        fetchOrders();
      }
    } catch (error) {
      console.error("Accept Order Error:", error);
      toast.error(error.response?.data?.message || "Failed to accept order.");
    }
  };

  const handleReject = async (orderId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(`${url}/api/order/vendor/reject/${orderId}`, {}, { headers });
      if (response.data.success) {
        toast.success("Order rejected!");
        fetchOrders();
      }
    } catch (error) {
      console.error("Reject Order Error:", error);
      toast.error(error.response?.data?.message || "Failed to reject order.");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      let response;

      if (role === "vendor") {
        response = await axios.put(
          `${url}/api/order/vendor/status/${orderId}`,
          { status: newStatus },
          { headers }
        );
      } else {
        response = await axios.post(
          `${url}/api/order/updatestatus`,
          { orderId, status: newStatus },
          { headers }
        );
      }

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (error) {
      console.error("Update Status Error:", error);
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, activeTab]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Order Desk
          </h1>
          <p className="text-gray-500 mt-2">
            {role === "superadmin" ? "Monitor and manage orders globally." : "Manage your restaurant orders."}
          </p>
        </div>

        {/* Tabs Row */}
        <div className="flex gap-4 border-b border-gray-200 pb-4 mb-8">
          {[
            { id: "pending", label: "Pending Orders" },
            { id: "active", label: "Active Prep" },
            { id: "history", label: "Past History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-bold transition text-sm ${
                activeTab === tab.id
                  ? "bg-[#ef4f5f] text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#ef4f5f] rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-bold text-gray-600">No Orders Found</h2>
            <p className="text-gray-400 mt-2">There are currently no orders in this list.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-gray-50 hover:bg-gray-100/80 rounded-2xl p-5 border border-gray-200/50 shadow-sm transition duration-300"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6 lg:items-center">
                  
                  {/* Order Meta */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-rose-100 text-[#ef4f5f] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide">
                        {order.status}
                      </span>
                      <h2 className="font-extrabold text-gray-800 text-lg">
                        Order #{order._id.slice(-6)}
                      </h2>
                    </div>

                    <p className="text-gray-400 text-xs font-semibold">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>

                    {role === "superadmin" && order.restaurant && (
                      <p className="text-sm font-bold text-indigo-600">
                        Restaurant: {order.restaurant.name}
                      </p>
                    )}

                    <p className="text-sm font-semibold text-gray-700">
                      Customer: {order.user?.name || "Guest Customer"} ({order.user?.email || "No Email"})
                    </p>

                    <p className="text-sm text-gray-600">
                      <strong>Amount:</strong> <span className="text-[#ef4f5f] font-extrabold">${order.amount}</span>
                    </p>

                    <p className="text-sm text-gray-600">
                      <strong>Payment Status:</strong>{" "}
                      <span className={order.payment ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                        {order.payment ? "Paid (Stripe)" : "Pending"}
                      </span>
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center gap-3">
                    {activeTab === "pending" && role === "vendor" && (
                      <>
                        <button
                          onClick={() => handleAccept(order._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(order._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {activeTab === "active" && (
                      <div>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="border border-gray-300 rounded-xl px-4 py-2 bg-white font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-[#ef4f5f]/20 focus:border-[#ef4f5f] cursor-pointer"
                        >
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY">READY</option>
                          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    )}

                    {activeTab === "history" && (
                      <span className="text-sm text-gray-400 font-bold italic">
                        Archived State
                      </span>
                    )}
                  </div>
                </div>

                {/* Ordered Items details */}
                <div className="mt-5 border-t border-gray-200/60 pt-4">
                  <h3 className="font-bold text-gray-700 text-sm mb-3">
                    Ordered Dishes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm bg-white p-2.5 rounded-xl border border-gray-100"
                      >
                        <span className="text-gray-800 font-medium">
                          {item.food?.name || "Dish (Deleted)"}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping info */}
                <div className="mt-4 bg-white/50 p-4 rounded-xl border border-gray-100 text-xs text-gray-600">
                  <h3 className="font-bold text-gray-700 text-xs mb-2">
                    Delivery Contact Details
                  </h3>
                  <p className="font-medium">
                    {typeof order.address === "object"
                      ? `${order.address.firstName || ""} ${order.address.lastName || ""}`
                      : order.address}
                  </p>
                  <p className="mt-1">
                    {typeof order.address === "object"
                      ? `${order.address.street || ""}, ${order.address.city || ""}, ${order.address.state || ""}, ${order.address.zip || ""} - ${order.address.phone || ""}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;