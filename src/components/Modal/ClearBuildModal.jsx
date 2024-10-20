import React from "react";
import { motion } from "framer-motion";
import Button from "../UI/Button";
import { TrashIcon } from "@heroicons/react/24/outline";

const ClearBuildModal = ({ onClear, onCancel }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <TrashIcon className="w-8 h-8 text-red-500" />
        <h2 className="text-[#E0E1E6] text-xl font-semibold">
          Очистить сборку
        </h2>
      </div>
      <p className="text-[#9D9EA6]">
        Вы уверены, что хотите удалить все товары из вашей сборки? Это действие
        нельзя будет отменить.
      </p>
      <motion.div
        className="flex justify-end space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button onClick={onCancel} variant="secondary">
          Отмена
        </Button>
        <Button onClick={onClear} variant="danger">
          Очистить сборку
        </Button>
      </motion.div>
    </div>
  );
};

export default ClearBuildModal;
