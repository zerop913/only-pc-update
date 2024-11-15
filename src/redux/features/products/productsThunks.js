import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { CONFIG } from "../../config";
import { cacheManager } from "../../middleware/cacheMiddleware";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    { categoryShortName, childCategoryShortName, page = 1, limit = 50 },
    { rejectWithValue }
  ) => {
    const cacheKey = `products_${categoryShortName}_${childCategoryShortName}_${page}_${limit}`;

    try {
      // Проверяем кеш
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return normalizeProductResponse(cachedData);
      }

      const url = `/categories/${categoryShortName}${
        childCategoryShortName ? `/${childCategoryShortName}` : ""
      }`;

      const response = await api.get(url, { params: { page, limit } });
      const data = response.data;

      // Кешируем результат
      cacheManager.set(cacheKey, data, CONFIG.PRIORITIES.PRODUCTS);

      return normalizeProductResponse(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке продуктов"
      );
    }
  },
  {
    meta: {
      cache: true,
      priority: CONFIG.PRIORITIES.PRODUCTS,
    },
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "products/fetchProductBySlug",
  async ({ categoryPath, slug }, { rejectWithValue, getState }) => {
    if (!categoryPath || !slug) {
      return rejectWithValue("Missing category or product slug");
    }

    const cacheKey = `product_${categoryPath}_${slug}`;

    try {
      // Проверяем кеш
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        const categories = getState().categories.items;
        return enrichProductData(cachedData, categories, categoryPath);
      }

      const response = await api.get(`/products/${categoryPath}/${slug}`);
      const data = response.data;

      // Кешируем результат
      cacheManager.set(cacheKey, data, CONFIG.PRIORITIES.PRODUCTS);

      const categories = getState().categories.items;
      return enrichProductData(data, categories, categoryPath);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке продукта"
      );
    }
  },
  {
    meta: {
      cache: true,
      priority: CONFIG.PRIORITIES.PRODUCTS,
    },
  }
);

// Вспомогательные функции
const normalizeProductResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      products: data,
      totalPages: 1,
      currentPage: 1,
    };
  }

  return {
    products: data.products || [],
    totalPages: data.totalPages || 1,
    currentPage: data.currentPage || 1,
  };
};

const enrichProductData = (productData, categoriesData, categoryPath) => {
  const pathParts = categoryPath.split("/");
  const mainCategory = categoriesData.find(
    (cat) => cat.short_name === pathParts[0]
  );

  let subcategoryData = null;
  if (pathParts[1] && mainCategory) {
    subcategoryData = mainCategory.children?.find(
      (sub) => sub.short_name === pathParts[1]
    );
  }

  return {
    ...productData,
    category: mainCategory,
    subcategory: subcategoryData,
  };
};
