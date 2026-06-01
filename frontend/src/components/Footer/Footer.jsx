import React from "react";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-white mt-24">
      
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          
          {/* Left Section */}
          <div>
            <img
              src={assets.logo}
              alt="Logo"
              className="w-36 mb-6 brightness-0 invert"
            />

            <p className="text-gray-400 leading-relaxed text-sm">
              Discover the best food from over 1,000 restaurants and fast
              delivery to your doorstep. Fresh meals, amazing taste, and
              unforgettable experiences — all in one place.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-6">
              
              <div className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#ef4f5f] transition-all duration-300 flex items-center justify-center cursor-pointer">
                <img
                  src={assets.facebook_icon}
                  alt="Facebook"
                  className="w-5 h-5"
                />
              </div>

              <div className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#ef4f5f] transition-all duration-300 flex items-center justify-center cursor-pointer">
                <img
                  src={assets.twitter_icon}
                  alt="Twitter"
                  className="w-5 h-5"
                />
              </div>

              <div className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#ef4f5f] transition-all duration-300 flex items-center justify-center cursor-pointer">
                <img
                  src={assets.linkedin_icon}
                  alt="LinkedIn"
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>

          {/* Center Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Company
            </h2>

            <ul className="space-y-4 text-gray-400">
              <li className="hover:text-[#ef4f5f] cursor-pointer transition-colors duration-300">
                Home
              </li>

              <li className="hover:text-[#ef4f5f] cursor-pointer transition-colors duration-300">
                About Us
              </li>

              <li className="hover:text-[#ef4f5f] cursor-pointer transition-colors duration-300">
                Delivery
              </li>

              <li className="hover:text-[#ef4f5f] cursor-pointer transition-colors duration-300">
                Privacy Policy
              </li>
            </ul>
          </div>

          {/* Right Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Get In Touch
            </h2>

            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                📞 +91 7866010143
              </li>

              <li className="flex items-center gap-3">
                📧 support@zomato.com
              </li>

              <li className="flex items-center gap-3">
                📍 Siliguri, India
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Zomato Clone. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;