import React from "react";

const Button = ({
  children,
  icon: Icon,
  onClick,
  isTablet,
  className = "",
}) => {
  return (
    <button
      className={`flex items-center px-2 sm:px-3 lg:px-4 py-2 rounded-full bg-gradient-to-br from-[#1D1E2C] to-[#252736] text-[#9D9EA6] hover:from-[#22243A] hover:to-[#2A2C44] hover:text-[#B8B9C3] transition-all duration-200 ${
        isTablet ? "md:text-xs lg:text-sm" : "text-sm"
      } ${className}`}
      onClick={onClick}
    >
      {Icon && (
        <Icon
          className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${
            isTablet ? "md:w-3 md:h-3 md:mr-1 lg:w-4 lg:h-4 lg:mr-2" : ""
          }`}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
