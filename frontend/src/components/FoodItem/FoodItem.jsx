import React, { useState } from "react";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({
  id,
  name,
  image,
  price,
  description,
  category,
}) => {
    const {cartItems, addToCart, removeFromCart,url} = React.useContext(StoreContext);
    const itemCount = cartItems[id] || 0;
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-[#ef4f5f] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
          ${price}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          {description}
        </p>

        {/* Bottom */}
        <div className="flex items-center justify-between">
          
          {/* Category */}
          <span className="text-sm font-medium text-[#ef4f5f] bg-red-50 px-3 py-1 rounded-full">
            {category}
          </span>

          {/* Button */}
         {
  itemCount === 0 ? (
    <button
      className="px-5 py-2 bg-[#ef4f5f] text-white rounded-xl font-medium hover:bg-[#d93b4b] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
      onClick={() => addToCart(id)}
    >
      Add +
    </button>
  ) : (
    <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-xl shadow-sm">

      {/* Minus */}
      <button
        onClick={() => removeFromCart(id)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#ef4f5f] text-xl font-bold shadow hover:scale-110 transition-all duration-200"
      >
        -
      </button>

      {/* Count */}
      <span className="text-lg font-semibold text-gray-700 min-w-[20px] text-center">
        {itemCount}
      </span>

      {/* Plus */}
      <button
        onClick={() => addToCart(id)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#ef4f5f] text-white text-xl font-bold shadow hover:scale-110 transition-all duration-200"
      >
        +
      </button>
    </div>
  )
}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;