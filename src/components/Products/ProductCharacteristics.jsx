import React, { forwardRef } from "react";
import { motion } from "framer-motion";

const ProductCharacteristics = forwardRef(({ characteristics }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#1D1E2C] rounded-xl p-4 md:p-6 shadow-md h-full"
    >
      <h2 className="text-xl md:text-2xl font-bold text-[#E0E1E6] mb-8">
        Характеристики
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {characteristics.map((char, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex flex-col space-y-1.5 border-b border-[#2A2D3E] pb-4"
          >
            <span className="text-[#9D9EA6] text-sm">{char.name}</span>
            <span className="text-[#E0E1E6] font-medium">{char.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

export default ProductCharacteristics;
