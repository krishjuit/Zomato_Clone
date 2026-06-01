import React, { useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Verify = () => {
  const navigate = useNavigate();

  const { url , token } = useContext(StoreContext);

  const searchParams = new URLSearchParams(window.location.search);

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const verifyPayment = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/verify`,
        {
          success,
          orderId,
        },  
      );

      console.log(response.data);

      if (response.data.success) {
        navigate("/myorders");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error(
        "Verify Payment Error:",
        error.response?.data || error.message
      );

      navigate("/");
    }
  };

  useEffect(() => {
  verifyPayment();
}, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-[#ef4f5f] rounded-full animate-spin"></div>

      <h1 className="mt-4 text-lg font-semibold">
        Verifying your payment...
      </h1>
    </div>
  );
};

export default Verify;