import React, { useState, useEffect, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 3000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  useEffect(() => {
    window.showNotification = showNotification;
    return () => {
      delete window.showNotification;
    };
  }, [showNotification]);

  const bgColors = {
    info: "bg-[#1D1E2C]",
    success: "bg-[#1D2C1E]",
    warning: "bg-[#2C2A1E]",
    error: "bg-[#2C1E1E]",
  };

  const iconColors = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  };

  const getIcon = (type) => {
    switch (type) {
      case "info":
        return "ℹ️";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="fixed z-50 top-4 right-4 sm:right-4 sm:left-auto left-4 sm:transform-none space-y-2 w-auto max-w-[calc(100%-2rem)] sm:max-w-sm">
      <AnimatePresence>
        {notifications.map(({ id, message, type }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 w-full`}
          >
            <span className={`text-2xl ${iconColors[type]}`}>
              {getIcon(type)}
            </span>
            <span className="flex-grow">{message}</span>
            <button
              onClick={() => removeNotification(id)}
              className="focus:outline-none"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
