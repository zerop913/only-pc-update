import axios from "axios";

const API_URL = "http://localhost:3000/api";

const cache = new Map();

const getCacheKey = (url, params) => {
  return `${url}?${new URLSearchParams(params).toString()}`;
};

const cacheRequest = async (url, params = {}) => {
  const cacheKey = getCacheKey(url, params);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const response = await axios.get(url, { params });
  cache.set(cacheKey, response.data);
  return response.data;
};

export const fetchCategories = async () => {
  try {
    return await cacheRequest(`${API_URL}/categories`);
  } catch (error) {
    console.error("Ошибка при получении категорий:", error);
    throw error;
  }
};

export const fetchProducts = async (
  categoryShortName,
  childCategoryShortName,
  page = 1,
  limit = 50
) => {
  try {
    let url = `${API_URL}/categories/${categoryShortName}`;
    if (childCategoryShortName) {
      url += `/${childCategoryShortName}`;
    }
    const params = { page, limit };
    const data = await cacheRequest(url, params);

    if (Array.isArray(data)) {
      return {
        products: data,
        totalPages: 1,
        currentPage: 1,
      };
    } else if (data.categories) {
      return {
        categories: data.categories,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      };
    } else if (data.products) {
      return {
        products: data.products,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      };
    }

    return { products: [], totalPages: 0, currentPage: 1 };
  } catch (error) {
    console.error("Ошибка при запросе продуктов:", error);
    throw error;
  }
};

export const fetchFilters = async (
  categoryShortName,
  childCategoryShortName
) => {
  try {
    let url = `${API_URL}/filter/${categoryShortName}`;
    if (childCategoryShortName) {
      url += `/${childCategoryShortName}`;
    }
    return await cacheRequest(url);
  } catch (error) {
    console.error("Ошибка при получении фильтров:", error);
    throw error;
  }
};

export const fetchFilteredProducts = async (
  categoryShortName,
  childCategoryShortName,
  filters,
  page = 1,
  limit = 9
) => {
  try {
    let url = `${API_URL}/filter/${categoryShortName}`;
    if (childCategoryShortName) {
      url += `/${childCategoryShortName}`;
    }
    const params = { page, limit, ...filters };
    return await cacheRequest(url, params);
  } catch (error) {
    console.error("Ошибка при получении отфильтрованных продуктов:", error);
    throw error;
  }
};

export const fetchProductBySlug = async (categoryPath, slug) => {
  if (!categoryPath || !slug) {
    throw new Error("Отсутствует категория или slug товара");
  }

  try {
    console.log(`Запрос товара: категория=${categoryPath}, slug=${slug}`);
    const url = `${API_URL}/products/${categoryPath}/${slug}`;
    const response = await axios.get(url);

    const pathParts = categoryPath.split("/");
    const mainCategoryResponse = await axios.get(
      `${API_URL}/categories/${pathParts[0]}`
    );

    let subcategoryData = null;
    if (pathParts[1]) {
      const subcategoriesResponse = await axios.get(
        `${API_URL}/categories/${pathParts[0]}/${pathParts[1]}`
      );
      subcategoryData = subcategoriesResponse.data;
    }

    return {
      ...response.data,
      category: mainCategoryResponse.data,
      subcategory: subcategoryData,
    };
  } catch (error) {
    console.error("Ошибка при получении информации о товаре:", error);
    throw new Error(
      "Ошибка при загрузке товара. Пожалуйста, попробуйте позже."
    );
  }
};
