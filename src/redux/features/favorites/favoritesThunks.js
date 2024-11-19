import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { CONFIG } from "../../config";
import { cacheManager } from "../../middleware/cacheMiddleware";

export const addToFavorites = createAsyncThunk(
  "favorites/addToFavorites",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post("/favorites/add", { productId });
      // Инвалидируем кэш избранных
      cacheManager.clear();
      return { productId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при добавлении в избранное"
      );
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  "favorites/removeFromFavorites",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post("/favorites/remove", { productId });
      // Инвалидируем кэш избранных
      cacheManager.clear();
      return { productId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при удалении из избранного"
      );
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    const cacheKey = `favorites_${page}_${limit}`;

    try {
      // Проверяем кеш
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await api.get("/favorites", {
        params: { page, limit },
      });

      // Кешируем результат
      const data = response.data;
      cacheManager.set(cacheKey, data, CONFIG.PRIORITIES.PROFILE);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Ошибка при получении избранных товаров"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { favorites } = getState();
      const age = favorites.lastUpdated
        ? Date.now() - favorites.lastUpdated
        : null;
      return !age || age > CONFIG.CACHE.TTL;
    },
    meta: {
      cache: true,
      rateLimit: true,
      priority: CONFIG.PRIORITIES.PROFILE,
    },
  }
);

export const checkFavoriteStatus = createAsyncThunk(
  "favorites/checkFavoriteStatus",
  async (productIds, { rejectWithValue }) => {
    const cacheKey = `favorites_status_${productIds.join("_")}`;

    try {
      // Проверяем кеш
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await api.post("/favorites/check-status", {
        productIds,
      });

      // Кешируем результат
      const data = response.data;
      cacheManager.set(cacheKey, data, CONFIG.PRIORITIES.PROFILE);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при проверке избранных товаров"
      );
    }
  },
  {
    meta: {
      cache: true,
      rateLimit: true,
      priority: CONFIG.PRIORITIES.PROFILE,
    },
  }
);
