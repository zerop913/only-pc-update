import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToFavorites,
  removeFromFavorites,
  fetchFavorites,
  checkFavoriteStatus,
} from "../redux/features/favorites/favoritesThunks";
import { useAuth } from "./useAuth";

export const useFavorites = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
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
      if (isAuthenticated && productIds.length > 0) {
        dispatch(checkFavoriteStatus(productIds));
      }
    },
    [dispatch, isAuthenticated]
  );

  const toggleFavorite = useCallback(
    async (productId) => {
      if (!isAuthenticated) return;

      try {
        const isCurrentlyFavorite = favoriteProductIds.includes(productId);
        const action = isCurrentlyFavorite
          ? removeFromFavorites(productId)
          : addToFavorites(productId);

        await dispatch(action).unwrap();
        return true;
      } catch (err) {
        console.error("Ошибка при изменении статуса избранного:", err);
        throw err;
      }
    },
    [dispatch, favoriteProductIds, isAuthenticated]
  );

  const loadFavorites = useCallback(
    (page = 1, limit = 100, forceFetch = false) => {
      dispatch(fetchFavorites({ page, limit, forceFetch }));
    },
    [dispatch]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites(1, 100, true);
    }
  }, [isAuthenticated, loadFavorites]);

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
