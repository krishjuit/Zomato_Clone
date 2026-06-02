import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Settings = ({ url, token, role }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [cuisineStr, setCuisineStr] = useState("");
  const [isActive, setIsActive] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const decodeToken = (t) => {
    try {
      const base64Url = t.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const loadVendorRestaurant = async (vendorId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/restaurant/list?owner=${vendorId}`);
      if (response.data.success && response.data.restaurants?.length > 0) {
        populateForm(response.data.restaurants[0]);
      } else {
        toast.error("No restaurant profile associated with this vendor account.");
      }
    } catch (error) {
      console.error("Load Vendor Restaurant Error:", error);
      toast.error("Failed to load restaurant profile settings.");
    } finally {
      setLoading(false);
    }
  };

  const loadAllRestaurants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/restaurant/list?all=true`);
      if (response.data.success) {
        setRestaurants(response.data.restaurants || []);
      }
    } catch (error) {
      console.error("Load All Restaurants Error:", error);
      toast.error("Failed to load restaurants list.");
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedRestaurant = async (restaurantId) => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/restaurant/${restaurantId}`);
      if (response.data.success && response.data.restaurant) {
        populateForm(response.data.restaurant);
      }
    } catch (error) {
      console.error("Load Selected Restaurant Error:", error);
      toast.error("Failed to load restaurant details.");
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (restaurant) => {
    setSelectedRestaurantId(restaurant._id);
    setName(restaurant.name || "");
    setDescription(restaurant.description || "");
    setAddress(restaurant.address || "");
    setImage(restaurant.image || "");
    setCuisineStr(restaurant.cuisine ? restaurant.cuisine.join(", ") : "");
    setIsActive(restaurant.isActive !== undefined ? restaurant.isActive : true);
  };

  useEffect(() => {
    if (role === "vendor") {
      const decoded = decodeToken(token);
      if (decoded && decoded.userId) {
        loadVendorRestaurant(decoded.userId);
      } else {
        toast.error("Invalid token format.");
      }
    } else if (role === "superadmin") {
      loadAllRestaurants();
    }
  }, [role, token]);

  const handleRestaurantSelect = (e) => {
    const rId = e.target.value;
    setSelectedRestaurantId(rId);
    if (rId) {
      loadSelectedRestaurant(rId);
    } else {
      // Clear form
      setSelectedRestaurantId("");
      setName("");
      setDescription("");
      setAddress("");
      setImage("");
      setCuisineStr("");
      setIsActive(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRestaurantId) {
      toast.error("No restaurant selected for updating.");
      return;
    }
    if (!name || !address) {
      toast.error("Name and Address are required.");
      return;
    }

    setSaving(true);
    const cuisineArray = cuisineStr
      ? cuisineStr.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const payload = {
      name,
      description,
      address,
      image,
      cuisine: cuisineArray,
      isActive,
    };

    try {
      const response = await axios.put(
        `${url}/api/restaurant/${selectedRestaurantId}`,
        payload,
        { headers }
      );
      if (response.data.success) {
        toast.success("Restaurant settings updated successfully!");
        // Refresh settings list if superadmin
        if (role === "superadmin") {
          loadAllRestaurants();
        }
      } else {
        toast.error(response.data.message || "Failed to update restaurant settings.");
      }
    } catch (error) {
      console.error("Update Restaurant Error:", error);
      toast.error(error.response?.data?.message || "Failed to save restaurant settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Restaurant Settings</h1>
        <p className="text-sm text-gray-500 font-medium">
          {role === "superadmin"
            ? "Select and configure details of any restaurant outlet"
            : "Update and manage your restaurant profile details"}
        </p>
      </div>

      {/* Selector for Superadmin */}
      {role === "superadmin" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
            Target Restaurant to Manage
          </label>
          <select
            className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm bg-white"
            value={selectedRestaurantId}
            onChange={handleRestaurantSelect}
          >
            <option value="">-- Choose Restaurant --</option>
            {restaurants.map((res) => (
              <option key={res._id} value={res._id}>
                {res.name} ({res.owner?.name || "No Owner Email"}) - {res.isActive ? "Active" : "Inactive"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Settings Form */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ef4f5f] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500">Loading settings profile...</p>
        </div>
      ) : role === "superadmin" && !selectedRestaurantId ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <span className="text-4xl">🏢</span>
          <h3 className="text-lg font-bold text-gray-800 mt-4">No restaurant selected</h3>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
            Choose a restaurant from the dropdown list above to view and configure its options.
          </p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bella Italia"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm font-bold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Cuisines (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Italian, Pizza, Desserts"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                  value={cuisineStr}
                  onChange={(e) => setCuisineStr(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                Restaurant Description
              </label>
              <textarea
                placeholder="Brief description of the menu specialty, themes, and hours..."
                rows="4"
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                placeholder="123 Main St, New York, NY"
                required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Banner Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/banner.jpg"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#ef4f5f] outline-none text-sm"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Live Preview
                </label>
                <div className="w-full h-24 rounded-xl border overflow-hidden bg-gray-50 flex items-center justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">No Image</span>
                  )}
                </div>
              </div>
            </div>

            {/* Status settings */}
            <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-700">Accepting Orders</h4>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Toggle off to temporarily close the restaurant from search & ordering menus
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 bg-[#ef4f5f] hover:bg-[#d93b4b] disabled:bg-rose-300 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition active:scale-[0.98] cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Restaurant Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
