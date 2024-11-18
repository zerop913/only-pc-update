import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import Navigation from "./Navigation";
import SearchBar from "./SearchBar";
import UserActions from "./UserActions";
import MobileMenu from "./MobileMenu";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#0E0F18] h-[72px] py-4 px-4 sm:px-6 border-b border-[#1F1E24] z-40">
        <div className="flex items-center justify-between h-full max-w-[100vw]">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Logo />
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Navigation isTablet={isTablet} />
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <SearchBar isTablet={isTablet} />
            <UserActions isMobile={false} />
          </div>
          <button
            className="md:hidden text-white p-2 hover:bg-[#1F1E24] rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
      </header>
      <div className="h-[72px]" />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};

export default Header;
