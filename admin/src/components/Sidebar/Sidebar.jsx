import React from "react";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = ({ role }) => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
    ${
      isActive
        ? "bg-[#ef4f5f] text-white shadow-md"
        : "hover:bg-[#fff1f2] hover:text-[#ef4f5f] text-gray-700"
    }`;

  return (
    <aside className="w-64 min-h-screen bg-white shadow-lg border-r hidden md:flex flex-col">

      {/* Top */}
      <div className="px-6 py-8 border-b">
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {role === "superadmin" ? "Super Admin Panel" : "Store Management"}
        </p>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-3 p-4">

        {/* Analytics Dashboard */}
        <NavLink to="/dashboard" className={linkClass}>
          <svg
            className="w-6 h-6 text-current"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="font-medium">
            Analytics
          </span>
        </NavLink>

        {/* Add Item */}
        <NavLink to="/add" className={linkClass}>
          <img
            src={assets.add_icon}
            alt="Add"
            className="w-6 h-6 object-contain"
          />

          <span className="font-medium">
            Add Item
          </span>
        </NavLink>

        {/* Orders */}
        <NavLink to="/orders" className={linkClass}>
          <img
            src={assets.order_icon}
            alt="Orders"
            className="w-6 h-6 object-contain"
          />

          <span className="font-medium">
            Orders
          </span>
        </NavLink>

        {/* List Items */}
        <NavLink to="/list" className={linkClass}>
          <img
            src={assets.order_icon}
            alt="List Items"
            className="w-6 h-6 object-contain"
          />

          <span className="font-medium">
            List Items
          </span>
        </NavLink>

      </div>

      {/* Bottom */}
      <div className="mt-auto p-4 border-t">
        <div className="bg-[#fff1f2] p-4 rounded-2xl">

          <h3 className="font-semibold text-gray-800">
            {role === "superadmin" ? "Super Admin" : "Vendor Panel"}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {role === "superadmin" ? "Platform Control Deck" : "Manage foods, orders and inventory easily."}
          </p>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;