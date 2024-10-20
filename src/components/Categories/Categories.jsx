import React, { useState } from "react";
import CategoryItem from "./CategoryItem";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import TotalPrice from "../TotalPrice/TotalPrice";

const Categories = ({
  categories,
  onCategorySelect,
  totalPrice,
  selectedCategory,
  selectedSubcategory,
  onSubcategorySelect,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleCategorySelect = (category) => {
    onCategorySelect(category);
    setIsDropdownOpen(false);
  };

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#12131E] rounded-xl p-4 sm:p-6 shadow-md border border-[#1F1E24]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Выберите компоненты</h2>
          <div className="flex items-center space-x-4">
            <TotalPrice total={totalPrice} />
          </div>
        </div>

        <div className="sm:hidden">
          <button
            onClick={toggleDropdown}
            className="w-full flex items-center justify-between px-4 py-2 bg-[#1D1E2C] text-[#9D9EA6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A4D5E] transition-all duration-200"
          >
            <span>
              {selectedCategory
                ? selectedCategory.russian_name
                : "Выберите категорию"}
            </span>
            {isDropdownOpen ? (
              <ChevronUpIcon className="w-5 h-5 transition-transform duration-200" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 transition-transform duration-200" />
            )}
          </button>

          <div
            className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
              isDropdownOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="bg-[#1D1E2C] rounded-lg overflow-hidden">
              {categories.map((category) => (
                <li key={category.short_name}>
                  <button
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left px-4 py-3 transition-all duration-200
                      ${
                        selectedCategory &&
                        selectedCategory.short_name === category.short_name
                          ? "bg-[#2A2D3E] text-[#E0E1E6]"
                          : "text-[#9D9EA6] hover:bg-[#22243A] hover:text-[#B8B9C3]"
                      }`}
                  >
                    {category.russian_name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hidden sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {categories.map((category) => (
            <CategoryItem
              key={category.short_name}
              name={category.russian_name}
              icon={category.image}
              isSelected={
                selectedCategory &&
                selectedCategory.short_name === category.short_name
              }
              onClick={() => handleCategorySelect(category)}
            />
          ))}
        </div>

        {selectedCategory &&
          selectedCategory.children &&
          selectedCategory.children.length > 0 && (
            <div className="mt-4">
              <h3 className="text-[#E0E1E6] text-lg font-semibold mb-2">
                Подкатегории
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategory.children.map((subcat) => (
                  <button
                    key={subcat.short_name}
                    onClick={() => onSubcategorySelect(subcat)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                      selectedSubcategory &&
                      selectedSubcategory.short_name === subcat.short_name
                        ? "bg-[#2A2D3E] text-[#E0E1E6]"
                        : "bg-[#1D1E2C] text-[#9D9EA6] hover:bg-[#252736] hover:text-[#B8B9C3]"
                    }`}
                  >
                    {subcat.russian_name}
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Categories;
