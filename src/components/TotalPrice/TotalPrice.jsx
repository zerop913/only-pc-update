import React from "react";

const TotalPrice = ({ total }) => {
  return (
    <div className="text-right">
      <h3 className="text-[#7D7D7D] text-sm font-semibold mb-1">
        Стоимость сборки
      </h3>
      <p className="text-white text-lg font-bold">
        {total.toLocaleString("ru-RU", {
          style: "currency",
          currency: "RUB",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </p>
    </div>
  );
};

export default TotalPrice;
