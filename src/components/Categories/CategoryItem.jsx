import React, { useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const CategoryItem = ({
  name,
  icon,
  isSelected,
  hasChildren,
  isExpanded,
  onClick,
}) => {
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch(`/${icon}`);
        const data = await response.text();
        const cleanedSvg = data.replace(/fill="[^"]*"/g, "");
        setSvgContent(cleanedSvg);
      } catch (error) {
        // Добавляем заглушку для тестов
        setSvgContent("<svg></svg>");
      }
    };

    if (icon) {
      loadSvg();
    }
  }, [icon]);

  return (
    <div
      data-testid="category-item"
      className={`rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative group
        ${
          isSelected
            ? "bg-gradient-to-br from-[#2A2D3E] to-[#353849] ring-2 ring-[#4A4D5E]"
            : "bg-gradient-to-br from-[#1D1E2C] to-[#252736] hover:from-[#22243A] hover:to-[#2A2C44]"
        }
      `}
      onClick={onClick}
    >
      <div className="w-8 h-8 mb-2 flex items-center justify-center">
        <div
          className={`w-full h-full transition-colors duration-300
            ${
              isSelected
                ? "fill-[#B8B9C3]"
                : "fill-[#6D6E7A] group-hover:fill-[#8D8E9A]"
            }
          `}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
      <span
        className={`text-xs font-medium text-center transition-colors duration-300
          ${
            isSelected
              ? "text-[#E0E1E6]"
              : "text-[#9D9EA6] group-hover:text-[#B8B9C3]"
          }
        `}
      >
        {name}
      </span>

      {hasChildren && (
        <ChevronDownIcon
          className={`w-4 h-4 absolute right-1 bottom-1 transition-transform duration-300
            ${isSelected ? "text-[#B8B9C3]" : "text-[#6D6E7A]"}
            ${isSelected && isExpanded ? "rotate-180" : "rotate-0"}
          `}
        />
      )}
    </div>
  );
};

export default CategoryItem;
