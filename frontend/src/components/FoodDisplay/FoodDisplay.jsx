import React, { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  return (
    <div className="px-4 sm:px-8 lg:px-16 py-12" id="food-display">
      
      {/* Heading */}
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-3">
          Top Dishes Near You
        </h2>

        <p className="text-gray-500 text-lg">
          Freshly prepared meals delivered hot and tasty.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        {food_list.map((item) => {

          if (
            category === "All" ||
            category === item.category
          ) {
            return (
              <FoodItem
                key={item._id}
                id={item._id}
                name={item.name}
                image={item.image}
                price={item.price}
                description={item.description}
                category={item.category}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default FoodDisplay;