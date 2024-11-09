import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#12131E] rounded-xl p-8 shadow-md border border-[#1F1E24] flex flex-col items-center justify-center text-center">
      <ExclamationTriangleIcon className="w-16 h-16 text-[#9D9EA6] mb-4" />
      <h3 className="text-[#E0E1E6] text-xl font-semibold mb-2">
        Страница не найдена
      </h3>
      <p className="text-[#9D9EA6] mb-6">
        Запрашиваемая страница не существует или была удалена.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-[#2A2D3E] text-[#E0E1E6] rounded-lg hover:bg-[#363B54] transition-colors duration-200"
      >
        Вернуться назад
      </button>
    </div>
  );
};

export default PageNotFound;
