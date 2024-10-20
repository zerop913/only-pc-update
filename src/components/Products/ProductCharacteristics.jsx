import React from "react";
import { motion } from "framer-motion";

const ProductCharacteristics = ({ characteristics }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#1D1E2C] rounded-xl p-4 md:p-6 shadow-md h-full"
    >
      <h2 className="text-xl md:text-2xl font-bold text-[#E0E1E6] mb-6">
        Характеристики
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {characteristics.map((char, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border-b border-[#2A2D3E] pb-2"
          >
            <span className="block text-[#9D9EA6] text-sm mb-1">
              {char.name}
            </span>
            <span className="block text-[#E0E1E6] font-medium">
              {char.value}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProductCharacteristics;
