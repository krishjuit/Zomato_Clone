import React from "react";
import { assets } from "../../assets/assets";

const AppDownload = () => {
  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 py-24">
      
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#ef4f5f] to-[#ff6b81] rounded-[40px] overflow-hidden shadow-2xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 px-8 sm:px-12 lg:px-16 py-14">
          
          {/* Left Content */}
          <div className="text-white">
            
            <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium mb-6">
              📱 Mobile Experience
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
              Download Our <br />
              Mobile App
            </h1>

            <p className="text-white/90 text-lg leading-relaxed mb-8 max-w-lg">
              Order food faster, track deliveries in real-time, and enjoy
              exclusive app-only offers with our premium mobile experience.
            </p>

            {/* Store Buttons */}
            <div className="flex flex-wrap items-center gap-5">
              
              <img
                src={assets.play_store}
                alt="Google Play"
                className="w-44 cursor-pointer hover:scale-105 transition-all duration-300 drop-shadow-xl"
              />

              <img
                src={assets.app_store}
                alt="App Store"
                className="w-44 cursor-pointer hover:scale-105 transition-all duration-300 drop-shadow-xl"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="relative flex justify-center">
            
            {/* Glow */}
            <div className="absolute w-72 h-72 bg-white/20 blur-3xl rounded-full"></div>

            {/* Phone Mockup */}
            <img
              src={assets.mobile_app}
              alt="Mobile App"
              className="relative w-[280px] sm:w-[340px] drop-shadow-2xl hover:scale-105 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;