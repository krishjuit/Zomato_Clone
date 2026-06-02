import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Login = ({ url, setToken, setRole }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantDesc, setRestaurantDesc] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantImage, setRestaurantImage] = useState("");
  const [restaurantCuisine, setRestaurantCuisine] = useState("");
  const [loading, setLoading] = useState(false);

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
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

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const token = response.data.token;
        const decoded = decodeToken(token);

        if (!decoded || !["vendor", "superadmin"].includes(decoded.role)) {
          toast.error("Access Denied: Only Vendors and Superadmins can access this dashboard.");
          setLoading(false);
          return;
        }

        localStorage.setItem("adminToken", token);
        setToken(token);
        setRole(decoded.role);
        toast.success("Welcome to the Admin Dashboard!");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(
        error.response?.data?.message || "Invalid credentials or server error"
      );
    } finally {
      setLoading(false);
    }
  };

  const onRegisterHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Register vendor user
      const registerRes = await axios.post(`${url}/api/user/register`, {
        name,
        email,
        password,
        role: "vendor",
      });

      if (registerRes.data.success) {
        const token = registerRes.data.token;
        const decoded = decodeToken(token);

        // 2. Create restaurant profile
        const cuisineArray = restaurantCuisine
          ? restaurantCuisine.split(",").map((c) => c.trim()).filter(Boolean)
          : ["General"];

        const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";

        const restaurantRes = await axios.post(
          `${url}/api/restaurant/`,
          {
            name: restaurantName,
            description: restaurantDesc || "Welcome to our kitchen!",
            address: restaurantAddress,
            image: restaurantImage.trim() || defaultImage,
            cuisine: cuisineArray,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (restaurantRes.data.success) {
          localStorage.setItem("adminToken", token);
          setToken(token);
          setRole("vendor");
          toast.success("Registration and Restaurant onboarding successful!");
        } else {
          toast.error(restaurantRes.data.message || "Vendor created, but failed to create restaurant profile.");
        }
      } else {
        toast.error(registerRes.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(
        error.response?.data?.message || "Registration failed. Check inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff1f2] to-gray-100 p-4 py-12">
      <div className={`w-full ${isRegister ? "max-w-[620px]" : "max-w-[420px]"} bg-white rounded-3xl p-8 shadow-2xl border border-rose-100 transition-all duration-300`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Zomato <span className="text-[#ef4f5f]">Admin</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {isRegister
              ? "Create Vendor account & Onboard your Restaurant"
              : "Manage your restaurants, menus, and orders"}
          </p>
        </div>

        {isRegister ? (
          <form onSubmit={onRegisterHandler} className="space-y-5">
            <div className="border-b pb-1">
              <span className="text-xs font-extrabold uppercase text-[#ef4f5f] tracking-wider">1. Account Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="vendor@kitchen.com"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="border-b pb-1 pt-1">
              <span className="text-xs font-extrabold uppercase text-[#ef4f5f] tracking-wider">2. Restaurant Profile</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  placeholder="Slice & Dice Pizza"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300 text-sm"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Cuisines (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Pizza, Italian, Fast Food"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300 text-sm"
                  value={restaurantCuisine}
                  onChange={(e) => setRestaurantCuisine(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Restaurant Description
              </label>
              <textarea
                placeholder="Describe your cuisines, specialty, or history..."
                rows="2"
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all resize-none text-sm"
                value={restaurantDesc}
                onChange={(e) => setRestaurantDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Restaurant Address
                </label>
                <input
                  type="text"
                  placeholder="123 Main St, City Center"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300 text-sm"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Banner Image URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300 text-sm"
                  value={restaurantImage}
                  onChange={(e) => setRestaurantImage(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#ef4f5f] text-white font-semibold rounded-2xl shadow-md hover:bg-[#d93b4b] hover:shadow-lg transition duration-200 active:scale-[0.98] disabled:bg-gray-400 mt-4 cursor-pointer"
            >
              {loading ? "Creating Vendor Profile..." : "Register as Vendor"}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="text-sm font-semibold text-[#ef4f5f] hover:underline cursor-pointer"
                onClick={() => setIsRegister(false)}
              >
                Already have an account? Login here
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSubmitHandler} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                required
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#ef4f5f] text-white font-semibold rounded-2xl shadow-md hover:bg-[#d93b4b] hover:shadow-lg transition duration-200 active:scale-[0.98] disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm font-semibold text-[#ef4f5f] hover:underline cursor-pointer"
                onClick={() => setIsRegister(true)}
              >
                New vendor? Register here
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
