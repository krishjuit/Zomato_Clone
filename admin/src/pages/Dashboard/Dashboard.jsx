import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = ({ url, token, role }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const endpoint =
        role === "superadmin"
          ? `${url}/api/analytics/admin`
          : `${url}/api/analytics/vendor`;

      const response = await axios.get(endpoint, { headers });
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error("Fetch Analytics Error:", error);
      toast.error(error.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token, role]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-gray-200 rounded-2xl h-32 p-6 flex flex-col justify-between">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-200 rounded-3xl h-64 p-6 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-300 rounded"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="bg-gray-200 rounded-3xl h-64 p-6 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl shadow p-8">
        <h2 className="text-xl font-bold text-gray-600">No Analytics Available</h2>
        <p className="text-gray-400 mt-2">Failed to resolve dashboard statistics.</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-5 py-2.5 bg-[#ef4f5f] text-white rounded-xl font-bold shadow-md text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          {role === "superadmin" ? "Platform Control Deck" : `${analytics.restaurantName} Analytics`}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {role === "superadmin"
            ? "Monitor platform restaurants, sales volume, and vendor summaries."
            : "Review sales performance, popular food items, and monthly summaries."}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {role === "superadmin" ? (
          <>
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 shadow-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Total Revenue</span>
              <p className="text-3xl font-black">${analytics.totalRevenue}</p>
              <p className="text-xs text-indigo-100 font-medium">Accumulated platform sales</p>
            </div>

            {/* Total Orders */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl p-6 shadow-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-100">Total Orders</span>
              <p className="text-3xl font-black">{analytics.totalOrders}</p>
              <p className="text-xs text-rose-100 font-medium">Total platform order tickets</p>
            </div>

            {/* Total Restaurants */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total Restaurants</span>
              <p className="text-3xl font-black">{analytics.totalRestaurants}</p>
              <p className="text-xs text-emerald-100 font-semibold">{analytics.activeRestaurants} active outlets</p>
            </div>

            {/* Active Vendors */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-6 shadow-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Active Vendors</span>
              <p className="text-3xl font-black">{analytics.activeVendors}</p>
              <p className="text-xs text-amber-100 font-medium">Onboarded store managers</p>
            </div>
          </>
        ) : (
          <>
            {/* Store Total Revenue */}
            <div className="bg-gradient-to-br from-[#ef4f5f] to-[#d83c4b] text-white rounded-2xl p-6 shadow-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-100">Total Revenue</span>
              <p className="text-3xl font-black">${analytics.totalRevenue}</p>
              <p className="text-xs text-red-100 font-medium">Store total sales</p>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-2xl p-6 shadow-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-100">Revenue This Month</span>
              <p className="text-3xl font-black">${analytics.revenueThisMonth}</p>
              <p className="text-xs text-sky-100 font-medium">Month-to-date performance</p>
            </div>

            {/* Total Orders */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 shadow-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Total Orders</span>
              <p className="text-3xl font-black">{analytics.totalOrders}</p>
              <p className="text-xs text-indigo-100 font-semibold">{analytics.deliveredOrders} delivered successfully</p>
            </div>

            {/* Pending Orders */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-6 shadow-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Pending Orders</span>
              <p className="text-3xl font-black">{analytics.pendingOrders}</p>
              <p className="text-xs text-amber-100 font-semibold">{analytics.activeOrders} actively cooking/preparing</p>
            </div>
          </>
        )}
      </div>

      {/* Analytics Lists & Status distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Popular metrics lists */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-extrabold text-gray-800">
            {role === "superadmin" ? "Top Restaurants by Revenue" : "Top Selling Food Items"}
          </h2>

          <div className="space-y-4">
            {role === "superadmin" ? (
              analytics.topRestaurants.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No restaurants sales recorded.</p>
              ) : (
                analytics.topRestaurants.map((r, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                    <div className="space-y-1">
                      <p className="font-extrabold text-gray-800">{r.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{r.orders} orders placed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-indigo-600">${r.revenue}</p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Sales Volume</span>
                    </div>
                  </div>
                ))
              )
            ) : (
              analytics.topSellingFoods.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No food sales recorded.</p>
              ) : (
                analytics.topSellingFoods.map((f, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                    <div className="space-y-1">
                      <p className="font-extrabold text-gray-800">{f.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{f.quantity} portions sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-[#ef4f5f]">${f.revenue}</p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Revenue</span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Right Column: Distribution stats */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <h2 className="text-xl font-extrabold text-gray-800 mb-6">
            Logistics Summary
          </h2>

          {role === "superadmin" ? (
            <div className="space-y-6 flex-grow flex flex-col justify-center">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>ACTIVE OUTLETS</span>
                  <span>{Math.round((analytics.activeRestaurants / (analytics.totalRestaurants || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-150 h-3.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(analytics.activeRestaurants / (analytics.totalRestaurants || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>OUTLETS RATIO ({analytics.activeRestaurants} / {analytics.totalRestaurants})</span>
                </div>
                <p className="text-xs text-gray-400">
                  {analytics.activeRestaurants} out of {analytics.totalRestaurants} total restaurant profiles are online.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 flex-grow flex flex-col justify-center">
              {/* Delivered */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>DELIVERED ORDERS</span>
                  <span>{analytics.deliveredOrders} ({Math.round((analytics.deliveredOrders / (analytics.totalOrders || 1)) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(analytics.deliveredOrders / (analytics.totalOrders || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Pending / Cooking */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>PENDING / IN PREPARATION</span>
                  <span>{analytics.pendingOrders + analytics.activeOrders} ({Math.round(((analytics.pendingOrders + analytics.activeOrders) / (analytics.totalOrders || 1)) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${((analytics.pendingOrders + analytics.activeOrders) / (analytics.totalOrders || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Cancelled */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>CANCELLED / REJECTED</span>
                  <span>{analytics.cancelledOrders} ({Math.round((analytics.cancelledOrders / (analytics.totalOrders || 1)) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${(analytics.cancelledOrders / (analytics.totalOrders || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
