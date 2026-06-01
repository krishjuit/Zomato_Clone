import React from "react";
import { menu_list } from "../../assets/assets";

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <div
      className="w-full py-16 px-4 sm:px-8 lg:px-16 overflow-hidden"
      id="explore-menu"
    >
      {/* Heading */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
          Explore Our Menu
        </h1>

        <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
          Choose from a diverse collection of delicious dishes crafted to
          satisfy every craving.
        </p>
      </div>

      {/* Sliding Section */}
      <div className="relative overflow-hidden">
        
        {/* Left Fade */}
        <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>

        {/* Right Fade */}
        <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>

        {/* Scroll Container */}
        <div className="flex gap-8 animate-scroll hover:[animation-play-state:paused] w-max">
          {[...menu_list, ...menu_list].map((item, index) => {
            const isActive = category === item.menu_name;

            return (
              <div
                key={index}
                onClick={() =>
                  setCategory((prev) =>
                    prev === item.menu_name ? "All" : item.menu_name
                  )
                }
                className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
              >
                {/* Image */}
                <div
                  className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-lg
                  ${
                    isActive
                      ? "border-[#ef4f5f] scale-110 shadow-2xl"
                      : "border-white group-hover:scale-105"
                  }`}
                >
                  <img
                    src={item.menu_image}
                    alt={item.menu_name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div
                    className={`absolute inset-0 transition-all duration-300
                    ${
                      isActive
                        ? "bg-black/10"
                        : "bg-black/0 group-hover:bg-black/10"
                    }`}
                  ></div>
                </div>

                {/* Label */}
                <h3
                  className={`mt-4 text-lg font-semibold transition-all duration-300
                  ${
                    isActive
                      ? "text-[#ef4f5f]"
                      : "text-gray-700 group-hover:text-[#ef4f5f]"
                  }`}
                >
                  {item.menu_name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExploreMenu;