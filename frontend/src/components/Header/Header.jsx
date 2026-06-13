import React from "react";
import { assets } from "../../assets/assets";

const Header = () => {
  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="relative w-full h-[90vh] overflow-hidden rounded-b-[40px]"
      style={{
        backgroundImage: `url(${assets.header_img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-6 sm:px-10 lg:px-20">
        <div className="max-w-2xl text-white animate-fadeIn">
          
          {/* Small Badge */}
          <span className="inline-block px-4 py-1 mb-5 text-sm font-medium tracking-wide bg-white/15 backdrop-blur-md rounded-full border border-white/20">
            🍔 Fast Delivery in 30 Minutes
          </span>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-[88px] leading-[0.95] font-extrabold mb-8">
            Order Your <br />
            Favorite Food
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-xl mb-8">
            Discover delicious meals from top restaurants near you.
            Fresh ingredients, lightning-fast delivery, and unbeatable taste —
            all in one place.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleScroll("menu-section")}
              className="px-7 py-3 rounded-full bg-[#ef4f5f] text-white font-semibold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              Explore Menu
            </button>

            <button
              onClick={() => handleScroll("mobile-app-section")}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-yellow-400 text-[16px] font-semibold rounded-2xl hover:bg-white hover:text-black hover:-translate-y-1 transition-all duration-300 shadow-md cursor-pointer"
            >
              Download App
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default Header;