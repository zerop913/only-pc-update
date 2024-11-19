import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Button from "../UI/Button";
import { useFavorites } from "../../hooks/useFavorites";

const ProfileFavorites = ({ favorites, loading }) => {
  const { toggleFavorite } = useFavorites();

  if (loading) {
    return (
      <div className="text-center py-12 bg-[#1D1E2C] rounded-xl">
        <div className="text-[#9D9EA6]">Загрузка...</div>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1D1E2C] rounded-xl">
        <div className="text-[#9D9EA6]">Список избранных товаров пуст</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {favorites.map((item) => (
        <Link
          key={item.id}
          to={`/products/${item.category_slug || "category"}/${item.slug}`}
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bg-[#12131E] rounded-xl p-4 shadow-md border border-[#1F1E24] hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer flex items-stretch space-x-4"
          >
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={
                  item.image_url
                    ? `/${item.image_url}`
                    : "/images/placeholder.png"
                }
                alt={item.name}
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  e.target.src = "/images/placeholder.png";
                }}
              />
            </div>
            <div className="flex flex-grow">
              <div className="flex items-center flex-grow">
                <h3 className="text-[#E0E1E6] font-semibold line-clamp-2">
                  {item.name}
                </h3>
              </div>
              <div className="flex flex-col items-end justify-center">
                <p className="text-[#9D9EA6] text-lg font-bold whitespace-nowrap mb-2">
                  {item.price?.toLocaleString()} ₽
                </p>
                <div className="flex space-x-2">
                  <Button
                    icon={PlusIcon}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    variant="secondary"
                    hideTooltipOnMobile
                  />
                  <Button
                    icon={HeartIcon}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    variant="secondary"
                    hideTooltipOnMobile
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
};

export default ProfileFavorites;
