import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Login");
  const {url,token,setToken}=useContext(StoreContext);
  const [data,setData]=useState({
    name:"",
    email:"",
    password:""
  })
  // const url=import.meta.env.VITE_BACKEND_URL;
  const onChangeHandler=(e)=>{
    setData({...data,[e.target.name]:e.target.value})
  }
  const onLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      `${url}/api/user/login`,
      {
        email: data.email,
        password: data.password,
      }
    );
    console.log(response);

    console.log("Login successful:", response.data);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
    }

    setShowLogin(false);

  } catch (error) {
    console.error(
      "Login error:",
      error.response?.data || error.message
    );
  }
};
  const onSignUp = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      `${url}/api/user/register`,
      {
        name: data.name,
        email: data.email,
        password: data.password,
      }
    );

    console.log(
      "Sign-up successful:",
      response.data
    );

    setCurrState("Login");

  } catch (error) {
    console.error(
      "Sign-up error:",
      error.response?.data || error.message
    );
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 pt-24 overflow-y-auto">
      
      {/* Modal */}
      <div className="relative w-full max-w-[380px] bg-white rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] animate-fadeIn scale-[0.92]">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#ef4f5f] to-[#ff6b81] px-6 pt-6 pb-5 text-white">
          
          {/* Close Button */}
          <button
            onClick={() => setShowLogin(false)}
            className="absolute top-4 right-4 text-3xl leading-none hover:rotate-90 transition-all duration-300"
          >
            ×
          </button>

          {/* Title */}
          <h2 className="text-3xl font-extrabold tracking-tight">
            {currState}
          </h2>

          {/* Subtitle */}
          <p className="mt-2 text-white/90 text-sm leading-relaxed max-w-xs">
            {currState === "Login"
              ? "Welcome back! Login to continue ordering delicious food."
              : "Create your account and enjoy fast delivery."}
          </p>
        </div>

        {/* Form Section */}
        <div className="px-6 py-6">
          
          <form className="space-y-4"
            onSubmit={currState === "Login" ? onLogin : onSignUp}>
            
            {/* Full Name */}
            {currState === "Sign Up" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300"
                  name="name"
                  value={data.name}
                  onChange={onChangeHandler}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300"
                name="email"
                value={data.email}
                onChange={onChangeHandler}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ef4f5f] focus:ring-4 focus:ring-[#ef4f5f]/10 outline-none transition-all duration-300"
                name="password"
                value={data.password}
                onChange={onChangeHandler}
              />
            </div>

            {/* Terms Checkbox */}
            {currState === "Sign Up" && (
              <label className="flex items-start gap-3 cursor-pointer">
                
                <input
                  type="checkbox"
                  className="mt-1 accent-[#ef4f5f] w-4 h-4"
                />

                <span className="text-sm text-gray-500 leading-relaxed">
                  I agree to the{" "}
                  <span className="text-[#ef4f5f] font-semibold hover:underline">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-[#ef4f5f] font-semibold hover:underline">
                    Privacy Policy
                  </span>
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-[#ef4f5f] text-white font-semibold hover:bg-[#d93b4b] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
            >
              {currState === "Login"
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          {/* Bottom Switch */}
          <div className="mt-6 text-center">
            {currState === "Login" ? (
              <p className="text-gray-500 text-sm">
                New user?{" "}
                <button
                  onClick={() => setCurrState("Sign Up")}
                  className="text-[#ef4f5f] font-semibold hover:underline"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p className="text-gray-500 text-sm">
                Already a customer?{" "}
                <button
                  onClick={() => setCurrState("Login")}
                  className="text-[#ef4f5f] font-semibold hover:underline"
                >
                  Login Here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;