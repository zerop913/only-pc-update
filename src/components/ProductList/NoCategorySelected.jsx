import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const NoCategorySelected = () => {
  return (
    <div className="bg-[#12131E] rounded-xl p-6 sm:p-8 shadow-md border border-[#1F1E24]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="flex-shrink-0">
          <InformationCircleIcon className="w-12 h-12 text-[#4A4D5E]" />
        </div>
        <div className="flex-grow">
          <h2 className="text-[#E0E1E6] text-xl sm:text-2xl font-semibold mb-4">
            Выберите категорию
          </h2>
          <p className="text-[#9D9EA6] mb-4">
            Для просмотра товаров, пожалуйста, выберите категорию из списка.
          </p>
          <ol className="text-[#9D9EA6] list-decimal list-inside space-y-2">
            <li>Просмотрите доступные категории в меню</li>
            <li>Нажмите на интересующую вас категорию</li>
            <li>Ознакомьтесь с товарами в выбранной категории</li>
            <li>Добавляйте понравившиеся товары в вашу сборку</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default NoCategorySelected;
