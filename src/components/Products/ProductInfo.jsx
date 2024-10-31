import React from "react";
import {
  HeartIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Button from "../UI/Button";
import { motion } from "framer-motion";

const ProductInfo = ({
  product,
  isTransitioning,
  onShowAllCharacteristics,
}) => {
  const mainCharacteristics = product.characteristics.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Изображение */}
      <motion.div
        className="p-8 lg:p-12 flex items-center justify-center"
        initial={{ opacity: isTransitioning ? 0 : 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.img
          src={
            product.image_url
              ? `/${product.image_url}`
              : "/images/placeholder.png"
          }
          alt={product.name}
          className="w-auto max-h-[500px] object-contain rounded-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          onError={(e) => {
            e.target.src = "/images/placeholder.png";
          }}
        />
      </motion.div>

      {/* Информация */}
      <motion.div
        className="flex flex-col h-full justify-center"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#E0E1E6] mb-3">
            {product.name}
          </h1>
        </div>

        <div className="mb-8">
          <span className="text-3xl font-bold text-[#E0E1E6]">
            {product.price.toLocaleString()} ₽
          </span>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <Button
            icon={PlusIcon}
            onClick={() => {}}
            variant="primary"
            className="w-full py-3.5 text-base font-medium bg-gradient-to-r from-[#3B3E4F] to-[#2A2D3E] hover:from-[#4A4D5E] hover:to-[#353849] transition-all duration-300"
          >
            Добавить в сборку
          </Button>
          <Button
            icon={HeartIcon}
            onClick={() => {}}
            variant="secondary"
            className="w-full py-3.5 text-base font-medium border border-[#2A2D3E] hover:bg-[#2A2D3E] transition-all duration-300"
          >
            В избранное
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#E0E1E6]">
              Основные характеристики
            </h3>
            <button
              onClick={onShowAllCharacteristics}
              className="text-sm text-[#9D9EA6] hover:text-[#E0E1E6] transition-colors duration-200 flex items-center gap-1"
            >
              Все характеристики
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2.5">
            {mainCharacteristics.map((char, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-[#1D1E2C]"
              >
                <span className="text-[#9D9EA6] text-sm">{char.name}</span>
                <span className="text-[#E0E1E6] text-sm font-medium">
                  {char.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductInfo;
