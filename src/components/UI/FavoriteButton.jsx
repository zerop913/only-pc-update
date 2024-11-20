import React, { useCallback } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../hooks/useAuth";
import Button from "./Button";

const FavoriteButton = ({ productId, className = "" }) => {
  const { isAuthenticated } = useAuth();
  const { favoriteProductIds, toggleFavorite } = useFavorites();
  const isFavorite = favoriteProductIds.includes(productId);

  const handleToggleFavorite = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated) {
        window.showNotification(
          "Для добавления в избранное необходимо авторизоваться",
          "warning"
        );
        return;
      }

      try {
        await toggleFavorite(productId);
        window.showNotification(
          isFavorite
            ? "Товар удален из избранного"
            : "Товар добавлен в избранное",
          isFavorite ? "info" : "success"
        );
      } catch (error) {
        window.showNotification(
          "Произошла ошибка при обновлении избранного",
          "error"
        );
      }
    },
    [isAuthenticated, toggleFavorite, productId, isFavorite]
  );

  return (
    <Button
      onClick={handleToggleFavorite}
      aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      {isFavorite ? (
        <HeartSolid className="w-5 h-5 text-red-500 hover:text-red-600" />
      ) : (
        <HeartOutline className="w-5 h-5 text-gray-400 hover:text-red-500" />
      )}
    </Button>
  );
};

export default React.memo(FavoriteButton);
