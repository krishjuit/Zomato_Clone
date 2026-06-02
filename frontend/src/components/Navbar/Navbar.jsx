import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({setShowLogin}) => {
  const [menu, setMenu] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const {getTotalCartAmount,token,setToken} = React.useContext(StoreContext);
  const menuItems = [
    { id: "home", label: "Home" },
    { id: "menu", label: "Menu" },
    { id: "mobile-app", label: "Mobile App" },
    { id: "contact", label: "Contact" },
  ];
  const navigate = useNavigate();
  const logout=()=>{
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-[78px]">
          
          {/* Logo */}
            <Link to="/" className="flex items-center gap-2">   
            <div className="flex items-center gap-2 cursor-pointer group">
            <img
              src={assets.logo}
              alt="Logo"
              className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-10">
            {menuItems.map((item) => (
              <li
                key={item.id}
                onClick={() => setMenu(item.id)}
                className={`relative cursor-pointer text-[15px] font-medium tracking-wide transition-all duration-300 ${
                  menu === item.id
                    ? "text-[#ef4f5f]"
                    : "text-gray-600 hover:text-[#ef4f5f]"
                }`}
              >
                {item.label}

                {/* Active underline */}
                <span
                  className={`absolute left-0 -bottom-2 h-[3px] rounded-full bg-[#ef4f5f] transition-all duration-300 ${
                    menu === item.id ? "w-full" : "w-0"
                  }`}
                />
              </li>
            ))}
          </ul>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Search */}
            <Link to="/search" className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-100 hover:bg-[#fff1f2] transition-all duration-300 group">
              <img
                src={assets.search_icon}
                alt="Search"
                className="w-5 h-5 opacity-70 group-hover:opacity-100"
              />
            </Link>

            {/* Cart */}
            <div className="relative">
              <Link to="/cart" className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-100 hover:bg-[#fff1f2] transition-all duration-300 group">
                <img
                  src={assets.basket_icon}
                  alt="Basket"
                  className="w-5 h-5 opacity-70 group-hover:opacity-100"
                />
              </Link>

              {/* Notification Dot */}
              {getTotalCartAmount() > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4f5f] rounded-full border border-white"></span>
              )}
            </div>

            {/* Sign In */}
            {token ? (
  <div className="relative group">
    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all">
      <img
        src={assets.profile_icon}
        alt="Profile"
        className="w-8 h-8"
      />
    </button>

    <ul className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
      <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer">
        My Profile
      </li>

      <li className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer"
      onClick={() => navigate("/myorders")}
      >
        <img
          src={assets.bag_icon}
          alt=""
          className="w-4"
        />
        Orders
      </li>

      <li
        onClick={logout}
        className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer text-red-500"
      >
        <img
          src={assets.logout_icon}
          alt=""
          className="w-4"
        />
        Logout
      </li>
    </ul>
  </div>
              ) : (
                <button
                  className="relative overflow-hidden px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ef4f5f] to-[#ff6b81] text-white text-sm font-semibold tracking-wide shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                  onClick={() => setShowLogin(true)}
                >
                  <span className="flex items-center gap-2">
                    Sign In
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </button>
              )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
            
            {/* Mobile Cart */}
            <div className="relative">
              <Link to="/cart" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-[#fff1f2] transition-all duration-300 group">
                <img
                  src={assets.basket_icon} 
                    alt="Basket"
                    className="w-4 h-4 opacity-70 group-hover:opacity-100"
                />
              </Link>

              {getTotalCartAmount() > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4f5f] rounded-full border border-white"></span>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "max-h-[500px] border-t border-gray-100"
            : "max-h-0"
        }`}
      >
        <div className="bg-white px-5 py-5 space-y-4 shadow-inner">
          
          {/* Search Box */}
          <div 
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate("/search");
            }}
            className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3 cursor-pointer"
          >
            <img
              src={assets.search_icon}
              alt="Search"
              className="w-4 h-4 opacity-60"
            />
            <span className="text-gray-400 text-sm">Search your favourite food...</span>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setMenu(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  menu === item.id
                    ? "bg-[#fff1f2] text-[#ef4f5f]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Sign In */}
          {token ? (
  <div className="space-y-2">
    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100">
      <img
        src={assets.profile_icon}
        alt=""
        className="w-5"
      />
      Profile
    </button>

    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100"
    onClick={() => navigate("/myorders")}
    >
      <img
        src={assets.bag_icon}
        alt=""
        className="w-5"
      />
      Orders
    </button>

    <button
      onClick={logout}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white"
    >
      <img
        src={assets.logout_icon}
        alt=""
        className="w-5"
      />
      Logout
    </button>
  </div>
) : (
  <button
    className="w-full py-3 rounded-xl bg-[#ef4f5f] text-white font-semibold shadow-md hover:opacity-95 transition-all duration-300"
    onClick={() => setShowLogin(true)}
  >
    Sign In
  </button>
)}
        </div>
      </div>
    </header>
  );
};

export default Navbar;