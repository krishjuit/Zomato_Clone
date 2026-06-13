import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreProvider = ({ children }) => {
  const url = import.meta.env.VITE_BACKEND_URL;

  const [food_list, setFoodList] = useState([]);
  const [restaurant_list, setRestaurantList] = useState([]);
  
  const [cartItems, setCartItems] = useState(() => {
    const localCart = localStorage.getItem("cartItems");
    try {
      return localCart ? JSON.parse(localCart) : {};
    } catch {
      return {};
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });

  const [showLogin, setShowLogin] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

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
    setCartItems((prev) => {
      const updated = { ...prev };
      updated[itemId] = (updated[itemId] || 0) + 1;
      return updated;
    });

    if (token) {
      try {
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
    }
  };

  // =========================
  // REMOVE ONE QUANTITY
  // =========================
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId]) {
        updated[itemId] -= 1;
        if (updated[itemId] <= 0) {
          delete updated[itemId];
        }
      }
      return updated;
    });

    if (token) {
      try {
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
    }
  };

  // =========================
  // DELETE ITEM COMPLETELY
  // =========================
  const deleteFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });

    if (token) {
      try {
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
  // SAVE GUEST CART IN LOCALSTORAGE
  // =========================
  useEffect(() => {
    if (!token) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } else {
      localStorage.removeItem("cartItems");
    }
  }, [cartItems, token]);

  // =========================
  // HANDLE TOKEN CHANGES (SYNC/LOAD/LOGOUT)
  // =========================
  useEffect(() => {
    const handleTokenChange = async () => {
      if (token) {
        const localCart = localStorage.getItem("cartItems");
        let guestCart = {};
        if (localCart) {
          try {
            guestCart = JSON.parse(localCart);
          } catch (e) {
            console.error(e);
          }
        }

        if (Object.keys(guestCart).length > 0) {
          try {
            const response = await axios.post(
              `${url}/api/cart/sync`,
              { cartData: guestCart },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.data.success) {
              setCartItems(response.data.cartData || {});
              localStorage.removeItem("cartItems");
            }
          } catch (error) {
            console.error("Sync Cart on Token Change Error:", error);
            await loadCartData(token);
          }
        } else {
          await loadCartData(token);
        }
      } else {
        // Logout or initial guest session
        const localCart = localStorage.getItem("cartItems");
        try {
          setCartItems(localCart ? JSON.parse(localCart) : {});
        } catch {
          setCartItems({});
        }
      }
    };

    handleTokenChange();
  }, [token]);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodItems();
      await fetchRestaurants();
    };

    loadData();
  }, []);

  const contextValue = {
    food_list,
    restaurant_list,
    cartItems,
    token,
    url,
    showLogin,
    appliedCouponCode,
    couponDiscount,

    setToken,
    setCartItems,
    setShowLogin,
    setAppliedCouponCode,
    setCouponDiscount,

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