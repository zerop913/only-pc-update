import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToFavorites,
  removeFromFavorites,
  fetchFavorites,
  checkFavoriteStatus,
} from "../redux/features/favorites/favoritesThunks";

export const useFavorites = () => {
  const dispatch = useDispatch();
  const {
    items: favorites,
    loading,
    error,
    favoriteProductIds,
    totalPages,
    currentPage,
  } = useSelector((state) => state.favorites);

  const checkProductsFavoriteStatus = useCallback(
    (productIds) => {
      dispatch(checkFavoriteStatus(productIds));
    },
    [dispatch]
  );

  const toggleFavorite = useCallback(
    async (productId) => {
      try {
        const isCurrentlyFavorite = favoriteProductIds.includes(productId);
        const action = isCurrentlyFavorite
          ? removeFromFavorites(productId)
          : addToFavorites(productId);

        await dispatch(action).unwrap();
      } catch (err) {
        console.error("Ошибка при изменении статуса избранного:", err);
      }
    },
    [dispatch, favoriteProductIds]
  );

  const loadFavorites = useCallback(
    (page = 1, limit = 10) => {
      dispatch(fetchFavorites({ page, limit }));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!favorites.length) {
      loadFavorites();
    }
  }, [loadFavorites, favorites.length]);

  return {
    favorites,
    favoriteProductIds,
    loading,
    error,
    totalPages,
    currentPage,
    toggleFavorite,
    loadFavorites,
    checkProductsFavoriteStatus,
  };
};
