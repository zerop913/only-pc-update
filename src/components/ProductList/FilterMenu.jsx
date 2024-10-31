import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PriceRangeSlider = ({
  minPrice,
  maxPrice,
  priceRange,
  setPriceRange,
}) => {
  const handleChange = (e, type) => {
    const value = parseInt(e.target.value);
    if (type === "min") {
      setPriceRange([Math.min(value, priceRange[1] - 1000), priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 1000)]);
    }
  };

  const getBackgroundSize = (value, type) => {
    const min =
      type === "min"
        ? ((value - minPrice) / (maxPrice - minPrice)) * 100
        : ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100;
    const max =
      type === "max"
        ? ((value - minPrice) / (maxPrice - minPrice)) * 100
        : ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100;

    return {
      backgroundSize: `${max - min}% 100%`,
      backgroundPosition: `${min}% center`,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-[#9D9EA6]">
        <span>{priceRange[0].toLocaleString()} ₽</span>
        <span>{priceRange[1].toLocaleString()} ₽</span>
      </div>
      <div className="relative h-1 mt-4">
        <div className="absolute w-full h-1 bg-[#1D1E2C] rounded-full" />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={priceRange[0]}
          onChange={(e) => handleChange(e, "min")}
          className="absolute w-full appearance-none bg-transparent pointer-events-none h-1
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#E0E1E6] [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2A2D3E]
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#E0E1E6] [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2A2D3E]"
          style={getBackgroundSize(priceRange[0], "min")}
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={priceRange[1]}
          onChange={(e) => handleChange(e, "max")}
          className="absolute w-full appearance-none bg-transparent pointer-events-none h-1
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#E0E1E6] [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2A2D3E]
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#E0E1E6] [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2A2D3E]"
          style={getBackgroundSize(priceRange[1], "max")}
        />
      </div>
    </div>
  );
};

const FilterMenu = ({ isOpen }) => {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [availability, setAvailability] = useState("all");

  const manufacturers = ["AMD", "Intel", "NVIDIA", "ASUS", "MSI"];

  const toggleManufacturer = (manufacturer) => {
    setSelectedManufacturers((prev) =>
      prev.includes(manufacturer)
        ? prev.filter((m) => m !== manufacturer)
        : [...prev, manufacturer]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="bg-[#12131E] rounded-xl p-4 border border-[#1F1E24] space-y-6">
            {/* Price Range */}
            <div className="space-y-2">
              <h3 className="text-[#E0E1E6] font-medium text-sm">Цена</h3>
              <PriceRangeSlider
                minPrice={0}
                maxPrice={100000}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </div>

            {/* Manufacturers */}
            <div className="space-y-2">
              <h3 className="text-[#E0E1E6] font-medium text-sm">
                Производитель
              </h3>
              <div className="flex flex-wrap gap-2">
                {manufacturers.map((manufacturer) => (
                  <button
                    key={manufacturer}
                    onClick={() => toggleManufacturer(manufacturer)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      selectedManufacturers.includes(manufacturer)
                        ? "bg-[#2A2D3E] text-[#E0E1E6]"
                        : "bg-[#1D1E2C] text-[#9D9EA6] hover:bg-[#252736] hover:text-[#B8B9C3]"
                    }`}
                  >
                    {manufacturer}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <h3 className="text-[#E0E1E6] font-medium text-sm">Наличие</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setAvailability("all")}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    availability === "all"
                      ? "bg-[#2A2D3E] text-[#E0E1E6]"
                      : "bg-[#1D1E2C] text-[#9D9EA6] hover:bg-[#252736] hover:text-[#B8B9C3]"
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setAvailability("inStock")}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    availability === "inStock"
                      ? "bg-[#2A2D3E] text-[#E0E1E6]"
                      : "bg-[#1D1E2C] text-[#9D9EA6] hover:bg-[#252736] hover:text-[#B8B9C3]"
                  }`}
                >
                  В наличии
                </button>
                <button
                  onClick={() => setAvailability("onOrder")}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    availability === "onOrder"
                      ? "bg-[#2A2D3E] text-[#E0E1E6]"
                      : "bg-[#1D1E2C] text-[#9D9EA6] hover:bg-[#252736] hover:text-[#B8B9C3]"
                  }`}
                >
                  Под заказ
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterMenu;
