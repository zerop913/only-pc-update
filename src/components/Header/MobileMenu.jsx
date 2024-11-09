import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Navigation from "./Navigation";
import SearchBar from "./SearchBar";
import UserActions from "./UserActions";
import Logo from "./Logo";

const MobileMenu = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0E0F18] flex flex-col transition-opacity duration-300 ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ maxWidth: "100vw", overflowX: "hidden" }}
    >
      <div className="flex justify-between items-center p-4 border-b border-[#1F1E24]">
        <Logo />
        <button onClick={onClose} className="text-white p-2">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        <div className="mb-6 max-w-full">
          <SearchBar />
        </div>
        <nav className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-2">Навигация</h3>
          <Navigation />
        </nav>
        <div className="max-w-full">
          <h3 className="text-white text-lg font-semibold mb-2">Действия</h3>
          <UserActions isMobile={true} />
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
