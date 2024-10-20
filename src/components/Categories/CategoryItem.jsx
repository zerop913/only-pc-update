import React, { useEffect, useState } from "react";

const CategoryItem = ({ name, icon, isSelected, onClick }) => {
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    fetch(`/${icon}`)
      .then((response) => response.text())
      .then((data) => {
        const cleanedSvg = data.replace(/fill="[^"]*"/g, "");
        setSvgContent(cleanedSvg);
      });
  }, [icon]);

  return (
    <div
      className={`rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
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
    </div>
  );
};

export default CategoryItem;
