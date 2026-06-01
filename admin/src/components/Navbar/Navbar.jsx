import React from "react";
import { assets } from "../../assets/assets.js";

const Navbar = ({ token, setToken, role, setRole, url }) => {
  return (
    <nav className="w-full h-20 bg-white shadow-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
      
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <img
          className=" h-12 object-contain"
          src={assets.logo}
          alt="logo"
        />

        <div>
          <p className="text-sm text-gray-500 font-medium">
            {role === "superadmin" ? "Global Platform Control" : "Manage your restaurant"}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        
        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <span className="text-2xl">🔔</span>

          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl">
            <img
              className="w-11 h-11 rounded-full object-cover border-2 border-[#ef4f5f]"
              src={assets.profile_image}
              alt="profile"
            />

            <div className="hidden sm:block">
              <p className="font-semibold text-gray-800">
                {role === "superadmin" ? "Super Admin" : "Vendor Owner"}
              </p>

              <p className="text-sm text-gray-500">
                {role === "superadmin" ? "Platform Owner" : "Restaurant Partner"}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              setToken("");
              setRole("");
            }}
            className="px-4 py-2 border border-red-100 hover:bg-red-50 text-[#ef4f5f] text-sm rounded-xl font-bold transition shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;