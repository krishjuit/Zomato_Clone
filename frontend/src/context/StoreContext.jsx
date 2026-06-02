import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreProvider = ({ children }) => {
  const url = import.meta.env.VITE_BACKEND_URL;

  const [food_list, setFoodList] = useState([]);
  const [restaurant_list, setRestaurantList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${url}/api/restaurant/list`);
      if (response.data.success) {
        setRestaurantList(response.data.restaurants);
      }
    } catch (error) {
      console.error("Fetch Restaurants Error:", error);
    }
  };

  // =========================
  // FETCH FOOD ITEMS
  // =========================
  const fetchFoodItems = async () => {
    try {
      const response = await axios.get(
        `${url}/api/food/list`
      );

      setFoodList(response.data);
    } catch (error) {
      console.error(
        "Fetch Food Error:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // LOAD CART DATA
  // =========================
  const loadCartData = async (authToken) => {
    try {
      if (!authToken) {
        setCartItems({});
        return;
      }

      const response = await axios.get(
        `${url}/api/cart/get`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      console.error(
        "Load Cart Error:",
        error.response?.data || error.message
      );

      setCartItems({});
    }
  };

  // =========================
  // ADD TO CART
  // =========================
  const addToCart = async (itemId) => {
  try {
    if (!token) return;

    const response = await axios.post(
      `${url}/api/cart/add`,
      { itemId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setCartItems(response.data.cartData);
    }
  } catch (error) {
    console.error(
      "Add Cart Error:",
      error.response?.data || error.message
    );
  }
};

  // =========================
  // REMOVE ONE QUANTITY
  // =========================
  const removeFromCart = async (itemId) => {
  try {
    if (!token) return;

    const response = await axios.post(
      `${url}/api/cart/remove`,
      { itemId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setCartItems(response.data.cartData);
    }
  } catch (error) {
    console.error(
      "Remove Cart Error:",
      error.response?.data || error.message
    );
  }
};

  // =========================
  // DELETE ITEM COMPLETELY
  // =========================
  const deleteFromCart = async (itemId) => {
  try {
    if (!token) return;

    const response = await axios.post(
      `${url}/api/cart/delete`,
      { itemId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setCartItems(response.data.cartData);
    }
  } catch (error) {
    console.error(
      "Delete Cart Error:",
      error.response?.data || error.message
    );
  }
};

  // =========================
  // TOTAL AMOUNT
  // =========================
  const getTotalCartAmount = () => {
    let total = 0;

    for (const itemId in cartItems) {
      const itemInfo = food_list.find(
        (food) => food._id === itemId
      );

      if (itemInfo) {
        total += itemInfo.price * cartItems[itemId];
      }
    }

    return total;
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodItems();
      await fetchRestaurants();

      const storedToken =
        localStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
    };

    loadData();
  }, []);

  const contextValue = {
    food_list,
    restaurant_list,
    cartItems,
    token,
    url,

    setToken,
    setCartItems,

    addToCart,
    removeFromCart,
    deleteFromCart,

    getTotalCartAmount,
    loadCartData,
    fetchRestaurants,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;