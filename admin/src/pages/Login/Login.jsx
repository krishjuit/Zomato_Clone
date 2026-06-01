import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Login = ({ url, setToken, setRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff1f2] to-gray-100 p-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 shadow-2xl border border-rose-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Zomato <span className="text-[#ef4f5f]">Admin</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Manage your restaurants, menus, and orders
          </p>
        </div>

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
            className="w-full h-12 bg-[#ef4f5f] text-white font-semibold rounded-2xl shadow-md hover:bg-[#d93b4b] hover:shadow-lg transition duration-200 active:scale-[0.98] disabled:bg-gray-400"
          >
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
