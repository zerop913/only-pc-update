import React from "react";
import { useImage } from "react-image";
import { useNavigate } from "react-router-dom";
import Button from "../UI/Button";
import {
  HeartIcon,
  PlusIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const ProductCard = ({
  item,
  viewMode,
  onAddToBuild,
  isInBuild,
  onCategorySelect,
  categoryPath,
}) => {
  const navigate = useNavigate();
  const isCategory = item.children !== undefined;

  const imageSrc = item.image_url
    ? `/${item.image_url}`
    : item.image
    ? `/images/${item.image}`
    : `/images/placeholder.png`;

  const { src, isLoading, error } = useImage({
    srcList: [imageSrc, `/images/placeholder.png`],
    useSuspense: false,
  });

  const handleCardClick = (e) => {
    if (isCategory) {
      onCategorySelect(item);
    } else if (item.slug) {
      window.open(`/products/${categoryPath}/${item.slug}`, "_blank");
    } else {
      console.error("Товар не имеет slug:", item);
    }
    e.preventDefault();
  };

  const cardClasses = `
    bg-[#12131E] rounded-xl p-4 shadow-md border border-[#1F1E24] 
    hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer
    ${
      viewMode === "grid"
        ? "flex flex-col h-full"
        : "flex flex-row items-stretch space-x-4"
    }
  `;

  const imageClasses = `
    ${
      viewMode === "grid"
        ? "w-full aspect-square mb-4"
        : "w-24 h-24 flex-shrink-0"
    }
    object-cover rounded-md transition-all duration-300 ease-in-out
  `;

  const contentClasses = `
    ${
      viewMode === "grid"
        ? "flex flex-col justify-between flex-grow"
        : "flex flex-grow"
    }
    transition-all duration-300 ease-in-out
  `;

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      <div className={imageClasses}>
        {isLoading ? (
          <div className="w-full h-full bg-[#1D1E2C] animate-pulse rounded-md"></div>
        ) : error ? (
          <div className="w-full h-full bg-[#1D1E2C] flex items-center justify-center text-[#9D9EA6] rounded-md">
            <span className="text-sm">Нет фото</span>
          </div>
        ) : (
          <img
            src={src}
            alt={item.name}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              console.error(`Ошибка загрузки изображения для ${item.name}:`, e);
              e.target.src = "/images/placeholder.png";
            }}
          />
        )}
      </div>
      <div className={contentClasses}>
        {viewMode === "grid" ? (
          <>
            <h3 className="text-[#E0E1E6] font-semibold line-clamp-2 mb-2">
              {item.name}
            </h3>
            <div className="flex justify-between items-center">
              {isCategory ? (
                <p className="text-[#9D9EA6] text-sm">
                  Подкатегории: {item.children.length}
                </p>
              ) : (
                <p className="text-[#9D9EA6] text-lg font-bold whitespace-nowrap">
                  {item.price?.toLocaleString()} ₽
                </p>
              )}
              <div
                className="flex space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                {isCategory ? (
                  <Button
                    icon={ChevronRightIcon}
                    onClick={() => onCategorySelect(item)}
                    tooltip="Открыть подкатегории"
                    variant="secondary"
                    hideTooltipOnMobile
                  />
                ) : (
                  <>
                    <Button
                      icon={PlusIcon}
                      onClick={() => onAddToBuild(item)}
                      tooltip={
                        isInBuild ? "Товар уже в сборке" : "Добавить в сборку"
                      }
                      variant={isInBuild ? "disabled" : "secondary"}
                      disabled={isInBuild}
                      hideTooltipOnMobile
                    />
                    <Button
                      icon={HeartIcon}
                      onClick={() => {}}
                      tooltip="Добавить в избранное"
                      variant="secondary"
                      hideTooltipOnMobile
                    />
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center flex-grow">
              <h3 className="text-[#E0E1E6] font-semibold line-clamp-2">
                {item.name}
              </h3>
            </div>
            <div className="flex flex-col items-end justify-center">
              {isCategory ? (
                <p className="text-[#9D9EA6] text-sm mb-2">
                  Подкатегории: {item.children.length}
                </p>
              ) : (
                <p className="text-[#9D9EA6] text-lg font-bold whitespace-nowrap mb-2">
                  {item.price?.toLocaleString()} ₽
                </p>
              )}
              <div
                className="flex space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                {isCategory ? (
                  <Button
                    icon={ChevronRightIcon}
                    onClick={() => onCategorySelect(item)}
                    tooltip="Открыть подкатегории"
                    variant="secondary"
                    hideTooltipOnMobile
                  />
                ) : (
                  <>
                    <Button
                      icon={PlusIcon}
                      onClick={() => onAddToBuild(item)}
                      tooltip={
                        isInBuild ? "Товар уже в сборке" : "Добавить в сборку"
                      }
                      variant={isInBuild ? "disabled" : "secondary"}
                      disabled={isInBuild}
                      hideTooltipOnMobile
                    />
                    <Button
                      icon={HeartIcon}
                      onClick={() => {}}
                      tooltip="Добавить в избранное"
                      variant="secondary"
                      hideTooltipOnMobile
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
