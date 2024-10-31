import axios from "axios";

export const API_URL = "http://localhost:3000/api";

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
  constructor(maxRequests = 3, timeWindow = 1000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.queue = new Map();
  }

  async checkLimit(key) {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(
      (time) => now - time < this.timeWindow
    );

    if (validTimestamps.length >= this.maxRequests) {
      const oldestRequest = validTimestamps[0];
      const waitTime = this.timeWindow - (now - oldestRequest);

      await new Promise((resolve) => {
        if (!this.queue.has(key)) {
          this.queue.set(key, []);
        }
        this.queue.get(key).push(resolve);
        setTimeout(() => {
          const resolvers = this.queue.get(key) || [];
          const resolver = resolvers.shift();
          if (resolver) resolver();
          if (resolvers.length === 0) {
            this.queue.delete(key);
          }
        }, waitTime);
      });

      return this.checkLimit(key);
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  clear() {
    this.requests.clear();
    this.queue.clear();
  }
}

const cache = new CacheManager(200, 10 * 60 * 1000);
const rateLimiter = new RateLimiter(3, 1000);

// Увеличиваем timeout и количество попыток
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Увеличили timeout до 30 секунд
  retry: 5, // Увеличили количество попыток до 5
  retryDelay: 1000, // Начальная задержка 1 секунда
});

// Улучшенная функция задержки с экспоненциальным увеличением
const delay = (retryCount) => {
  const baseDelay = 1000;
  return Math.min(baseDelay * Math.pow(2, retryCount - 1), 10000);
};

api.interceptors.request.use(async (config) => {
  const requestKey = `${config.method}_${config.url}`;
  await rateLimiter.checkLimit(requestKey);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Добавляем поле для отслеживания попыток, если его нет
    if (!config.retryCount) {
      config.retryCount = 0;
    }

    // Проверяем, можно ли повторить запрос
    const shouldRetry =
      config.retryCount < config.retry &&
      (!error.response || // Нет ответа от сервера
        error.response.status >= 500 || // Серверная ошибка
        error.response.status === 429 || // Rate limiting
        error.code === "ECONNABORTED" || // Timeout
        error.code === "ERR_NETWORK"); // Сетевая ошибка

    if (shouldRetry) {
      config.retryCount += 1;

      // Экспоненциальная задержка перед повторным запросом
      const retryDelay =
        error.response?.status === 429
          ? parseInt(error.response.headers["retry-after"]) * 1000 ||
            delay(config.retryCount)
          : delay(config.retryCount);

      // Очищаем очередь запросов при 429 ошибке
      if (error.response?.status === 429) {
        rateLimiter.clear();
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // Логируем повторную попытку
      console.log(`Retry attempt ${config.retryCount} for ${config.url}`);

      return api(config);
    }

    return Promise.reject(error);
  }
);

// Остальной код без изменений...
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

// Улучшенная функция кэширования с обработкой ошибок
const cacheRequest = async (url, params = {}) => {
  const cacheKey = getCacheKey(url, params);
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  return queueRequest(cacheKey, async () => {
    try {
      const response = await api.get(url, { params });
      if (response.data) {
        cache.set(cacheKey, response.data);
        return response.data;
      }
      throw new Error("Empty response data");
    } catch (error) {
      console.error(`Request error for ${url}:`, {
        params,
        status: error.response?.status,
        message: error.message,
      });

      // Возвращаем кэшированные данные, если они есть, даже если они устарели
      const staleData = cache.get(cacheKey);
      if (staleData) {
        console.log("Returning stale cached data while fetching failed");
        return staleData;
      }

      throw error;
    }
  });
};

// Модифицированная функция предзагрузки
async function preloadData() {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const categories = await fetchCategories();

      // Загружаем товары для каждой категории параллельно
      await Promise.allSettled(
        categories.map((category) => fetchProducts(category.short_name))
      );

      console.log("Data successfully preloaded");
      return;
    } catch (error) {
      retryCount++;
      console.error(`Preload attempt ${retryCount} failed:`, error);

      if (retryCount < maxRetries) {
        const waitTime = delay(retryCount);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }
}

// Улучшенная инициализация предзагрузки
const initPreload = () => {
  if (document.readyState === "complete") {
    preloadData();
  } else {
    window.addEventListener("load", preloadData);
  }
};

initPreload();

export const fetchCategories = async () => {
  try {
    return await cacheRequest(`${API_URL}/categories`);
  } catch (error) {
    console.error("Error fetching categories:", error);
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
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchProductBySlug = async (categoryPath, slug) => {
  if (!categoryPath || !slug) {
    throw new Error("Missing category or product slug");
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
      console.error("Error fetching product details:", {
        categoryPath,
        slug,
        error: error.message,
      });

      const staleData = cache.get(cacheKey);
      if (staleData) {
        return staleData;
      }

      throw new Error("Failed to load product. Please try again later.");
    }
  });
};
