import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { CONFIG } from "../../config";
import { cacheManager } from "../../middleware/cacheMiddleware";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue, getState }) => {
    const cacheKey = "categories_all";

    try {
      // Проверяем кеш
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await api.get("/categories");
      const data = response.data;

      // Кешируем результат
      cacheManager.set(cacheKey, data, CONFIG.PRIORITIES.CATEGORIES);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке категорий"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { categories } = getState();
      // Проверяем, есть ли уже загруженные категории и не устарели ли они
      if (categories.items.length > 0 && categories.lastUpdated) {
        const age = Date.now() - categories.lastUpdated;
        if (age < CONFIG.CACHE.TTL) {
          return false;
        }
      }
      return true;
    },
    meta: {
      cache: true,
      priority: CONFIG.PRIORITIES.CATEGORIES,
    },
  }
);
