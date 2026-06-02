import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets.js";
import axios from "axios";

const Navbar = ({ token, setToken, role, setRole, url }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${url}/api/notification/list`, { headers });
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Poll notifications every 20 seconds
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const markAllRead = async () => {
    try {
      const response = await axios.post(`${url}/api/notification/read-all`, {}, { headers });
      if (response.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  };

  const markSingleRead = async (id) => {
    try {
      const response = await axios.post(`${url}/api/notification/read/${id}`, {}, { headers });
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="w-full h-20 bg-white shadow-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
      
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <img
          className=" h-12 object-contain"
          src={assets.logo}
          alt="logo"
        />

        <div>
          <p className="text-sm text-gray-500 font-medium">
            {role === "superadmin" ? "Global Platform Control" : "Manage your restaurant"}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        
        {/* Notification */}
        <div className="relative">
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <span className="text-2xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center px-1 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden text-sm">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <span className="font-bold text-gray-800">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-xs text-[#ef4f5f] font-bold hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 italic">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id}
                      onClick={() => !n.isRead && markSingleRead(n._id)}
                      className={`p-3.5 transition hover:bg-gray-50 flex gap-2.5 cursor-pointer ${!n.isRead ? "bg-rose-50/30" : ""}`}
                    >
                      <div className="flex-1">
                        <p className={`text-xs ${!n.isRead ? "font-bold text-gray-900" : "text-gray-600"}`}>
                          {n.message}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl">
            <img
              className="w-11 h-11 rounded-full object-cover border-2 border-[#ef4f5f]"
              src={assets.profile_image}
              alt="profile"
            />

            <div className="hidden sm:block">
              <p className="font-semibold text-gray-800">
                {role === "superadmin" ? "Super Admin" : "Vendor Owner"}
              </p>

              <p className="text-sm text-gray-500">
                {role === "superadmin" ? "Platform Owner" : "Restaurant Partner"}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              setToken("");
              setRole("");
            }}
            className="px-4 py-2 border border-red-100 hover:bg-red-50 text-[#ef4f5f] text-sm rounded-xl font-bold transition shadow-sm cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;