import React from "react";
import { FolderIcon } from "@heroicons/react/24/outline";

const SelectSubcategory = ({ subcategories, onSubcategorySelect }) => {
  return (
    <div className="bg-[#12131E] rounded-xl p-6 shadow-md border border-[#1F1E24]">
      <div className="flex items-center space-x-4 mb-4">
        <FolderIcon className="w-8 h-8 text-[#4A4D5E]" />
        <h2 className="text-[#E0E1E6] text-xl font-semibold">
          Выберите подкатегорию
        </h2>
      </div>
      <p className="text-[#9D9EA6] mb-4">
        Для просмотра товаров, пожалуйста, выберите подкатегорию из списка ниже:
      </p>
      <div className="grid grid-cols-2 gap-4">
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => onSubcategorySelect(subcategory)}
            className="bg-[#1D1E2C] text-[#9D9EA6] px-4 py-2 rounded-md hover:bg-[#2A2D3E] hover:text-[#E0E1E6] transition-colors duration-200"
          >
            {subcategory.russian_name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectSubcategory;
