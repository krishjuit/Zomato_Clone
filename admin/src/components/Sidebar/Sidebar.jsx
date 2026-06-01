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