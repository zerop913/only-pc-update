import React, { useRef } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import Button from "../UI/Button";

const BuildItem = ({ item, onRemoveFromBuild }) => {
  const buttonRef = useRef(null);

  const imageSrc = item.image_url
    ? `/${item.image_url}`
    : item.image
    ? `/images/${item.image}`
    : `/images/placeholder.png`;

  return (
    <li className="flex items-center space-x-4 bg-[#1D1E2C] p-3 rounded-md">
      <div className="w-16 h-16 flex-shrink-0">
        <img
          src={imageSrc}
          alt={item.name}
          className="w-full h-full object-cover rounded-md"
          onError={(e) => {
            console.error(`Ошибка загрузки изображения для ${item.name}:`, e);
            e.target.src = "/images/placeholder.png";
          }}
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-[#E0E1E6] font-medium">{item.name}</h3>
        <p className="text-[#9D9EA6]">{item.price.toLocaleString()} ₽</p>
      </div>
      <div className="relative">
        <Button
          icon={TrashIcon}
          onClick={() => onRemoveFromBuild(item.id)}
          variant="secondary"
          ref={buttonRef}
        />
      </div>
    </li>
  );
};

const BuildList = ({ buildItems, onRemoveFromBuild, onClearBuild }) => {
  const clearButtonRef = useRef(null);

  return (
    <div className="bg-[#12131E] rounded-xl p-4 shadow-md border border-[#1F1E24]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#E0E1E6] text-xl font-semibold">Ваша сборка</h2>
        {buildItems.length > 0 && (
          <div className="relative">
            <Button
              icon={TrashIcon}
              onClick={onClearBuild}
              variant="secondary"
              ref={clearButtonRef}
            />
          </div>
        )}
      </div>
      {buildItems.length === 0 ? (
        <p className="text-[#9D9EA6]">
          Ваша сборка пуста. Добавьте товары из каталога.
        </p>
      ) : (
        <ul className="space-y-4">
          {buildItems.map((item) => (
            <BuildItem
              key={item.id}
              item={item}
              onRemoveFromBuild={onRemoveFromBuild}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuildList;
