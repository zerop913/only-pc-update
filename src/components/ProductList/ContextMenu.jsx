import React, { useState, useRef, useEffect } from "react";
import {
  ListBulletIcon,
  Squares2X2Icon,
  FunnelIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const ContextMenu = ({ viewMode, setViewMode, sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSortChange = (value) => {
    setSortBy(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortOptions = [
    { value: "name", label: "По названию" },
    { value: "price", label: "По цене" },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#12131E] rounded-xl p-4 shadow-md border border-[#1F1E24] space-y-4 sm:space-y-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <span className="text-[#E0E1E6] whitespace-nowrap">Сортировка:</span>
        <div className="relative w-full sm:w-48" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-between w-full bg-[#1D1E2C] text-[#9D9EA6] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A4D5E]"
          >
            <span>
              {sortOptions.find((option) => option.value === sortBy)?.label}
            </span>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`absolute z-10 w-full mt-1 bg-[#1D1E2C] border border-[#4A4D5E] rounded-md shadow-lg transition-all duration-200 ease-in-out ${
              isOpen
                ? "opacity-100 transform scale-y-100 translate-y-0"
                : "opacity-0 transform scale-y-95 -translate-y-2 pointer-events-none"
            }`}
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className="block w-full text-left px-4 py-2 text-[#9D9EA6] hover:bg-[#2A2D3E] focus:outline-none focus:bg-[#2A2D3E]"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-md ${
            viewMode === "list"
              ? "bg-[#2A2D3E] text-[#E0E1E6]"
              : "text-[#9D9EA6] hover:bg-[#1D1E2C]"
          }`}
        >
          <ListBulletIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-md ${
            viewMode === "grid"
              ? "bg-[#2A2D3E] text-[#E0E1E6]"
              : "text-[#9D9EA6] hover:bg-[#1D1E2C]"
          }`}
        >
          <Squares2X2Icon className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-md text-[#9D9EA6] hover:bg-[#1D1E2C]">
          <FunnelIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;
