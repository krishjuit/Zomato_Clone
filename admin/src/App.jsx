import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes, Navigate, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import Add from "./pages/Add/Add";
import Orders from "./pages/Orders/Orders";
import List from "./pages/List/List";
import EditFood from "./pages/Edit/EditFood";
import Login from "./pages/Login/Login";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [role, setRole] = useState("");

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

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && ["vendor", "superadmin"].includes(decoded.role)) {
        setRole(decoded.role);
      } else {
        localStorage.removeItem("adminToken");
        setToken("");
        setRole("");
      }
    }
  }, [token]);

  if (!token) {
    return (
      <>
        <ToastContainer />
        <Login url={url} setToken={setToken} setRole={setRole} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer></ToastContainer>
      {/* Navbar */}
      <Navbar token={token} setToken={setToken} setRole={setRole} role={role} url={url} />

      {/* Main Layout */}
      <div className="flex">

        {/* Sidebar */}
        <Sidebar role={role} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto">

          <Routes>

            {/* Default Route */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard url={url} token={token} role={role} />}
            />

            {/* Pages */}
            <Route
              path="/add"
              element={<Add url={url} token={token} role={role} />}
            />

            <Route
              path="/orders"
              element={<Orders url={url} token={token} role={role} />}
            />

            <Route
              path="/list"
              element={<List url={url} token={token} role={role} />}
            />

            <Route
              path="/edit/:foodId"
              element={<EditFood url={url} token={token} role={role} />}
            />

          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navbar (only visible on mobile screens < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around py-3.5 z-50">
        <NavLink to="/dashboard" className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${isActive ? "text-[#ef4f5f]" : "text-gray-500 hover:text-gray-800"}`}>
          <span className="text-lg">📊</span>
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${isActive ? "text-[#ef4f5f]" : "text-gray-500 hover:text-gray-800"}`}>
          <span className="text-lg">➕</span>
          <span>Add Item</span>
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${isActive ? "text-[#ef4f5f]" : "text-gray-500 hover:text-gray-800"}`}>
          <span className="text-lg">📦</span>
          <span>Orders</span>
        </NavLink>
        <NavLink to="/list" className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${isActive ? "text-[#ef4f5f]" : "text-gray-500 hover:text-gray-800"}`}>
          <span className="text-lg">📋</span>
          <span>List</span>
        </NavLink>
      </div>
    </div>
  );
};

export default App;