import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

const EmptyCategory = () => {
  return (
    <div className="bg-[#12131E] rounded-xl p-8 shadow-md border border-[#1F1E24] flex flex-col items-center justify-center text-center">
      <ExclamationCircleIcon className="w-16 h-16 text-[#9D9EA6] mb-4" />
      <h3 className="text-[#E0E1E6] text-xl font-semibold mb-2">
        В этой категории нет товаров
      </h3>
      <p className="text-[#9D9EA6]">
        Попробуйте выбрать другую категорию или вернитесь позже.
      </p>
    </div>
  );
};

export default EmptyCategory;
