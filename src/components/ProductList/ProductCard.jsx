import React from "react";
import {
  HeartIcon,
  PlusIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Button from "../UI/Button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ProductCard = ({
  item,
  viewMode,
  onAddToBuild,
  isInBuild,
  onCategorySelect,
  categoryPath,
  onProductClick,
}) => {
  const isCategory = item.children !== undefined;

  const imageSrc = item.image_url
    ? `/${item.image_url}`
    : item.image
      ? `/images/${item.image}`
      : `/images/placeholder.png`;

  const handleCardClick = async (e) => {
    if (isCategory) {
      onCategorySelect(item);
      return;
    }

    if (!item.slug) {
      console.error("Товар не имеет slug:", item);
      return;
    }

    // Если это не клик средней кнопкой мыши, используем стандартное поведение
    if (e.button !== 1) {
      e.preventDefault();
      onProductClick(categoryPath, item.slug);
    }
  };

  const handleAddToBuild = (e) => {
    e.preventDefault(); // Предотвращаем навигацию
    e.stopPropagation(); // Предотвращаем всплытие события
    onAddToBuild(item);
  };

  const productUrl = `/products/${categoryPath}/${item.slug}`;

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
    object-cover rounded-md
  `;

  const contentClasses = `
    ${
      viewMode === "grid"
        ? "flex flex-col justify-between flex-grow"
        : "flex flex-grow"
    }
  `;

  const CardContent = () => (
    <>
      <div className={imageClasses}>
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
              <div className="flex space-x-2">
                {isCategory ? (
                  <Button
                    icon={ChevronRightIcon}
                    onClick={(e) => {
                      e.preventDefault();
                      onCategorySelect(item);
                    }}
                    tooltip="Открыть подкатегории"
                    variant="secondary"
                    hideTooltipOnMobile
                  />
                ) : (
                  <>
                    <Button
                      icon={PlusIcon}
                      onClick={handleAddToBuild}
                      tooltip={
                        isInBuild ? "Товар уже в сборке" : "Добавить в сборку"
                      }
                      variant={isInBuild ? "disabled" : "secondary"}
                      disabled={isInBuild}
                      hideTooltipOnMobile
                    />
                    <Button
                      icon={HeartIcon}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
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
              <div className="flex space-x-2">
                {isCategory ? (
                  <Button
                    icon={ChevronRightIcon}
                    onClick={(e) => {
                      e.preventDefault();
                      onCategorySelect(item);
                    }}
                    tooltip="Открыть подкатегории"
                    variant="secondary"
                    hideTooltipOnMobile
                  />
                ) : (
                  <>
                    <Button
                      icon={PlusIcon}
                      onClick={handleAddToBuild}
                      tooltip={
                        isInBuild ? "Товар уже в сборке" : "Добавить в сборку"
                      }
                      variant={isInBuild ? "disabled" : "secondary"}
                      disabled={isInBuild}
                      hideTooltipOnMobile
                    />
                    <Button
                      icon={HeartIcon}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
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
    </>
  );

  return isCategory ? (
    <motion.div
      className={cardClasses}
      onClick={handleCardClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <CardContent />
    </motion.div>
  ) : (
    <Link to={productUrl} onClick={handleCardClick}>
      <motion.div
        className={cardClasses}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <CardContent />
      </motion.div>
    </Link>
  );
};

export default ProductCard;
