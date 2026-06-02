import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Coupons = ({ url, token, role }) => {
  const [coupons, setCoupons] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("");
  const [maximumDiscount, setMaximumDiscount] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/coupon/list`, { headers });
      if (response.data.success) {
        setCoupons(response.data.coupons || []);
      }
    } catch (error) {
      console.error("Fetch Coupons Error:", error);
      toast.error("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    if (role !== "superadmin") return;
    try {
      const response = await axios.get(`${url}/api/restaurant/list`);
      if (response.data.success) {
        setRestaurants(response.data.restaurants || []);
      }
    } catch (error) {
      console.error("Fetch Restaurants Error:", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchRestaurants();
  }, []);

  const resetForm = () => {
    setCode("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinimumOrderAmount("");
    setMaximumDiscount("");
    setIsGlobal(false);
    setSelectedRestaurant("");
    setExpiryDate("");
    setUsageLimit("");
    setIsEditing(false);
    setSelectedId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code || !discountValue || !expiryDate) {
      toast.error("Please fill in all required fields (Code, Value, Expiry Date).");
      return;
    }

    const payload = {
      code,
      description,
      discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscount: Number(maximumDiscount) || 0,
      isGlobal: role === "superadmin" ? isGlobal : false,
      restaurant: role === "superadmin" && !isGlobal ? selectedRestaurant : undefined,
      expiryDate: new Date(expiryDate).toISOString(),
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
    };

    try {
      if (isEditing) {
        // Update coupon
        const response = await axios.put(`${url}/api/coupon/update/${selectedId}`, payload, { headers });
        if (response.data.success) {
          toast.success("Coupon updated successfully!");
          fetchCoupons();
          resetForm();
        } else {
          toast.error(response.data.message || "Failed to update coupon.");
        }
      } else {
        // Create coupon
        const response = await axios.post(`${url}/api/coupon/create`, payload, { headers });
        if (response.data.success) {
          toast.success("Coupon created successfully!");
          fetchCoupons();
          resetForm();
        } else {
          toast.error(response.data.message || "Failed to create coupon.");
        }
      }
    } catch (error) {
      console.error("Coupon Save Error:", error);
      toast.error(error.response?.data?.message || "Failed to save coupon.");
    }
  };

  const handleEditClick = (coupon) => {
    setIsEditing(true);
    setSelectedId(coupon._id);

    setCode(coupon.code);
    setDescription(coupon.description || "");
    setDiscountType(coupon.discountType || "percentage");
    setDiscountValue(coupon.discountValue);
    setMinimumOrderAmount(coupon.minimumOrderAmount || "");
    setMaximumDiscount(coupon.maximumDiscount || "");
    setIsGlobal(coupon.isGlobal || false);
    setSelectedRestaurant(coupon.restaurant?._id || "");
    setUsageLimit(coupon.usageLimit || "");
    
    // Format date string for datetime-local input
    if (coupon.expiryDate) {
      const d = new Date(coupon.expiryDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      setExpiryDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setExpiryDate("");
    }

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon code?")) return;

    try {
      const response = await axios.delete(`${url}/api/coupon/delete/${id}`, { headers });
      if (response.data.success) {
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
      } else {
        toast.error(response.data.message || "Failed to delete coupon.");
      }
    } catch (error) {
      console.error("Delete Coupon Error:", error);
      toast.error("Failed to delete coupon.");
    }
  };

  const toggleActiveStatus = async (coupon) => {
    try {
      const response = await axios.put(
        `${url}/api/coupon/update/${coupon._id}`,
        { isActive: !coupon.isActive },
        { headers }
      );
      if (response.data.success) {
        toast.success(`Coupon ${!coupon.isActive ? "activated" : "deactivated"}!`);
        fetchCoupons();
      }
    } catch (error) {
      console.error("Toggle Status Error:", error);
      toast.error("Failed to change active status.");
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Promotions & Coupons</h1>
          <p className="text-sm text-gray-500 font-medium">Create, edit, toggle, or delete promotional codes</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="px-5 py-2.5 bg-[#ef4f5f] hover:bg-[#d93b4b] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition active:scale-[0.98] cursor-pointer text-sm"
        >
          {showForm ? "Cancel / Close Form" : "Create New Coupon"}
        </button>
      </div>

      {/* Coupon Modal Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-5">
            {isEditing ? "Edit Coupon Details" : "Create Promotion Coupon"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="SAVE30"
                  required
                  disabled={isEditing}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm font-bold uppercase disabled:bg-gray-50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Discount Type
                </label>
                <select
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Discount Value *
                </label>
                <input
                  type="number"
                  placeholder={discountType === "percentage" ? "30" : "5"}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Min Spend Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                  value={minimumOrderAmount}
                  onChange={(e) => setMinimumOrderAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Max Discount Capping ($)
                </label>
                <input
                  type="number"
                  placeholder="0 (Unlimited)"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                  value={maximumDiscount}
                  onChange={(e) => setMaximumDiscount(e.target.value)}
                  disabled={discountType === "flat"}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Usage Limit
                </label>
                <input
                  type="number"
                  placeholder="99999"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Expiry Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Description / Promo Label
                </label>
                <input
                  type="text"
                  placeholder="Get 30% off on Italian dishes"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Superadmin specific options */}
            {role === "superadmin" && !isEditing && (
              <div className="p-4 bg-gray-50 border border-dashed rounded-xl space-y-3">
                <span className="text-xs font-extrabold uppercase text-gray-700 tracking-wider">Superadmin Scoping Control</span>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#ef4f5f]"
                      checked={isGlobal}
                      onChange={(e) => {
                        setIsGlobal(e.target.checked);
                        if (e.target.checked) setSelectedRestaurant("");
                      }}
                    />
                    Mark as Global Platform Coupon
                  </label>

                  {!isGlobal && (
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Target Restaurant:</span>
                      <select
                        className="h-10 px-3 rounded-lg border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm max-w-xs"
                        value={selectedRestaurant}
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        required={!isGlobal}
                      >
                        <option value="">Select Restaurant</option>
                        {restaurants.map((res) => (
                          <option key={res._id} value={res._id}>
                            {res.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer text-sm"
              >
                {isEditing ? "Update Coupon" : "Save Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-[#ef4f5f] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-gray-500">Loading coupons catalogue...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 px-4">
            <span className="text-4xl">🏷️</span>
            <h3 className="text-lg font-bold text-gray-800 mt-4">No coupons registered yet</h3>
            <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
              Promotional codes will appear here once created. Use them to launch discount campaigns!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Spend Rule</th>
                  <th className="px-6 py-4">Scope</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiryDate);
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#ef4f5f] tracking-wide bg-rose-50 border border-rose-100/50 px-2.5 py-1 rounded-lg inline-block text-xs uppercase">
                          {coupon.code}
                        </div>
                        {coupon.description && (
                          <div className="text-xs text-gray-400 mt-1 font-normal max-w-xs truncate">
                            {coupon.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% Off`
                          : `$${coupon.discountValue} Off`}
                        {coupon.maximumDiscount > 0 && coupon.discountType === "percentage" && (
                          <span className="block text-xs text-gray-400 font-normal">
                            Cap: ${coupon.maximumDiscount}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {coupon.minimumOrderAmount > 0
                          ? `Min. $${coupon.minimumOrderAmount}`
                          : "No Minimum"}
                      </td>
                      <td className="px-6 py-4">
                        {coupon.isGlobal ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wide">
                            Global
                          </span>
                        ) : (
                          <span className="block text-xs max-w-[130px] truncate text-gray-600">
                            🏢 {coupon.restaurant?.name || "Single Outlet"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-bold">{coupon.usedCount}</span>
                        <span className="text-gray-400 font-normal"> / {coupon.usageLimit}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                        {new Date(coupon.expiryDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {expired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#ef4f5f] border border-rose-100 uppercase tracking-wide">
                            Expired
                          </span>
                        ) : (
                          <button
                            onClick={() => toggleActiveStatus(coupon)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition uppercase tracking-wide ${
                              coupon.isActive
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-rose-50 hover:text-[#ef4f5f] hover:border-rose-100"
                                : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100"
                            }`}
                            title={coupon.isActive ? "Click to Deactivate" : "Click to Activate"}
                          >
                            {coupon.isActive ? "Active" : "Disabled"}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => handleEditClick(coupon)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Coupon"
                          >
                            📝
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Coupon"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
