import React from "react";
import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";

const ActionButton = ({ icon: Icon, label, isMobile, isTablet, onClick }) => {
  if (isMobile) {
    return (
      <Button icon={Icon} onClick={onClick}>
        {label}
      </Button>
    );
  }

  return (
    <button
      onClick={onClick}
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
  const navigate = useNavigate();
  const { isAuthenticated, logout, displayName } = useAuth();

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      // await logout();
      navigate("/auth");
    }
  };

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
        icon={isAuthenticated ? UserIcon : ArrowRightOnRectangleIcon}
        label={isAuthenticated ? displayName || "Профиль" : "Войти"}
        isMobile={isMobile}
        isTablet={isTablet}
        onClick={handleAuthClick}
      />
    </div>
  );
};

export default UserActions;
