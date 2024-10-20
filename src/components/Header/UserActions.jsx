import React from "react";
import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Button from "../Button/Button";

const ActionButton = ({ icon: Icon, label, isMobile, isTablet }) => {
  if (isMobile) {
    return <Button icon={Icon}>{label}</Button>;
  }

  return (
    <button
      className={`flex flex-col items-center text-[#7D7D7D] hover:text-white transition-colors duration-200 ${
        isTablet ? "px-1" : ""
      }`}
    >
      <Icon className={`w-5 h-5 mb-1 ${isTablet ? "md:w-4 md:h-4" : ""}`} />
      <span className={`text-xs ${isTablet ? "hidden lg:inline" : ""}`}>
        {label}
      </span>
    </button>
  );
};

const UserActions = ({ isMobile, isTablet }) => {
  return (
    <div
      className={`flex ${
        isMobile
          ? "flex-col space-y-2"
          : `space-x-2 ${isTablet ? "md:space-x-1" : ""} lg:space-x-6`
      }`}
    >
      <ActionButton
        icon={HeartIcon}
        label="Избранное"
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <ActionButton
        icon={ShoppingCartIcon}
        label="Корзина"
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <ActionButton
        icon={UserIcon}
        label="Профиль"
        isMobile={isMobile}
        isTablet={isTablet}
      />
    </div>
  );
};

export default UserActions;
