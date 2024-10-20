import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchBar = ({ isTablet }) => {
  return (
    <div className="relative w-full md:w-auto">
      <input
        type="text"
        placeholder="Поиск..."
        className={`w-full md:w-auto pl-8 md:pl-10 pr-2 md:pr-4 py-2 rounded-full 
        bg-gradient-to-br from-[#1D1E2C] to-[#252736] 
        text-[#9D9EA6] placeholder-[#6D6E7A] 
        outline-none
        border-2 border-transparent
        focus:border-[#4A4D5E]
        transition-all duration-300 ease-in-out
        text-sm ${isTablet ? "md:max-w-[120px] lg:max-w-none" : ""}`}
      />
      <MagnifyingGlassIcon className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#6D6E7A]" />
    </div>
  );
};

export default SearchBar;
