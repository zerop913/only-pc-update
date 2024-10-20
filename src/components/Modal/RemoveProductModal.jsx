import React from "react";
import { motion } from "framer-motion";
import Button from "../UI/Button";

const ProductCard = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#12131E] rounded-lg p-4 flex items-center space-x-4"
    >
      <div className="w-16 h-16 flex-shrink-0">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div>
        <h3 className="text-[#E0E1E6] font-semibold">{product.name}</h3>
        <p className="text-[#9D9EA6]">{product.price.toLocaleString()} ₽</p>
      </div>
    </motion.div>
  );
};

const RemoveProductModal = ({ product, onRemove, onCancel }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-[#E0E1E6] text-xl font-semibold">
        Удалить товар из сборки?
      </h2>
      <p className="text-[#9D9EA6]">
        Вы уверены, что хотите удалить этот товар из вашей сборки?
      </p>
      <div className="space-y-2">
        <h3 className="text-[#E0E1E6]">Товар для удаления:</h3>
        <ProductCard product={product} />
      </div>
      <motion.div
        className="flex justify-end space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button onClick={onCancel} variant="secondary">
          Отмена
        </Button>
        <Button onClick={() => onRemove(product.id)}>Удалить</Button>
      </motion.div>
    </div>
  );
};

export default RemoveProductModal;
