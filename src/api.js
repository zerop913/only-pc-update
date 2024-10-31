import axios from "axios";

const API_URL = "http://localhost:3000/api";

class CacheManager {
  constructor(maxSize = 200, ttl = 10 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    this.clearExpired();

    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

class RateLimiter {
  constructor(maxRequests = 5, timeWindow = 1000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  async checkLimit(key) {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Удаляем старые метки времени
    const validTimestamps = timestamps.filter(
      (time) => now - time < this.timeWindow
    );

    if (validTimestamps.length >= this.maxRequests) {
      const oldestRequest = validTimestamps[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.checkLimit(key);
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }
}

const cache = new CacheManager(200, 10 * 60 * 1000); // Увеличиваем размер кэша и TTL до 10 минут
const rateLimiter = new RateLimiter(5, 1000); // Максимум 5 запросов в секунду

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  retry: 3,
  retryDelay: 2000, // Увеличиваем задержку между попытками
});

api.interceptors.request.use(async (config) => {
  const requestKey = `${config.method}_${config.url}`;
  await rateLimiter.checkLimit(requestKey);
  return config;
});

api.interceptors.response.use(null, async (error) => {
  const config = error.config;

  if (!config || !config.retry || config.retryCount >= config.retry) {
    return Promise.reject(error);
  }

  // Экспоненциальная задержка для повторных попыток
  const retryCount = (config.retryCount || 0) + 1;
  config.retryCount = retryCount;
  const delay = config.retryDelay * Math.pow(2, retryCount - 1);

  // Если ошибка 429, увеличиваем задержку
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers["retry-after"];
    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay * 2;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  } else {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return api(config);
});

const getCacheKey = (url, params) => {
  return `${url}?${new URLSearchParams(params).toString()}`;
};

const requestQueue = new Map();

const queueRequest = async (key, requestPromise) => {
  const existingRequest = requestQueue.get(key);
  if (existingRequest) {
    return existingRequest;
  }

  try {
    const promise = requestPromise();
    requestQueue.set(key, promise);
    const result = await promise;
    return result;
  } finally {
    requestQueue.delete(key);
  }
};

const cacheRequest = async (url, params = {}) => {
  const cacheKey = getCacheKey(url, params);
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  return queueRequest(cacheKey, async () => {
    try {
      const response = await api.get(url, { params });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Ошибка запроса к ${url}:`, {
        params,
        status: error.response?.status,
        message: error.message,
      });
      throw error;
    }
  });
};

async function preloadData() {
  try {
    // Получаем категории
    const categories = await fetchCategories();

    // Получаем товары для каждой категории
    for (const category of categories) {
      await fetchProducts(category.short_name);
    }

    console.log("Данные успешно загружены и сохранены в кэше");
  } catch (error) {
    console.error("Ошибка при предварительной загрузке данных:", error);
  }
}

window.addEventListener("load", preloadData);

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

export const fetchProductBySlug = async (categoryPath, slug) => {
  if (!categoryPath || !slug) {
    throw new Error("Отсутствует категория или slug товара");
  }

  const cacheKey = `product_${categoryPath}_${slug}`;
  const cachedProduct = cache.get(cacheKey);

  if (cachedProduct) {
    return cachedProduct;
  }

  return queueRequest(cacheKey, async () => {
    try {
      const url = `${API_URL}/products/${categoryPath}/${slug}`;
      const [productResponse, categoriesData] = await Promise.all([
        api.get(url),
        fetchCategories(),
      ]);

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

      const productData = {
        ...productResponse.data,
        category: mainCategory,
        subcategory: subcategoryData,
      };

      cache.set(cacheKey, productData);
      return productData;
    } catch (error) {
      console.error("Ошибка при получении информации о товаре:", {
        categoryPath,
        slug,
        error: error.message,
      });
      throw new Error(
        "Ошибка при загрузке товара. Пожалуйста, попробуйте позже."
      );
    }
  });
};
