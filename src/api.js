import axios from "axios";

export const API_URL = "http://localhost:3000/api";

const CONFIG = {
  CACHE: {
    MAX_SIZE: 200,
    TTL: 10 * 60 * 1000, // 10 минут
    STALE_TTL: 30 * 60 * 1000, // 30 минут для устаревших данных
  },
  RATE_LIMIT: {
    MAX_REQUESTS: 2,
    TIME_WINDOW: 1000,
    BURST_LIMIT: 5,
    MIN_BACKOFF: 1000,
    MAX_BACKOFF: 10000,
  },
  REQUEST: {
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    MAX_REDIRECTS: 5,
    MAX_CONTENT_LENGTH: 50 * 1024 * 1024,
  },
  AUTH: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 минут до истечения токена
    MAX_AUTH_RETRIES: 2,
    AUTH_QUEUE_TIMEOUT: 10000,
    AUTH_RATE_LIMIT: {
      MAX_REQUESTS: 5,
      TIME_WINDOW: 60 * 1000, // 1 минута
    },
  },
  PROFILE: {
    CACHE_TTL: 5 * 60 * 1000, // 5 минут кеширования профиля
    MAX_RETRIES: 2,
    BATCH_UPDATE_DELAY: 1000, // Задержка для батчинга обновлений профиля
  },
  PRIORITIES: {
    AUTH: 3,
    PROFILE: 2.5,
    CATEGORIES: 2,
    PRODUCTS: 1.5,
    DEFAULT: 1,
  },
};

class CacheManager {
  constructor(maxSize = CONFIG.CACHE.MAX_SIZE, ttl = CONFIG.CACHE.TTL) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.staleTtl = CONFIG.CACHE.STALE_TTL;
    this.priorities = new Map();
    this.lastCleanup = Date.now();
  }

  setPriority(key, priority) {
    this.priorities.set(key, priority);
  }

  set(key, value, priority = CONFIG.PRIORITIES.DEFAULT) {
    // Очищаем кеш только если прошло достаточно времени с последней очистки
    if (Date.now() - this.lastCleanup > this.ttl / 2) {
      this.clearExpired();
    }

    if (this.cache.size >= this.maxSize) {
      this.evictLowPriorityItems();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0,
      isStale: false,
    });
    this.setPriority(key, priority);
  }

  evictLowPriorityItems() {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        score: (this.priorities.get(key) || 1) * (1 + entry.accessCount),
        timestamp: entry.timestamp,
      }))
      .sort((a, b) => a.score - b.score || a.timestamp - b.timestamp);

    // Удаляем 10% элементов с наименьшим приоритетом
    const itemsToRemove = Math.max(1, Math.floor(this.cache.size * 0.1));
    entries.slice(0, itemsToRemove).forEach(({ key }) => {
      this.cache.delete(key);
      this.priorities.delete(key);
    });
  }

  get(key, allowStale = true) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    // Если данные свежие, возвращаем их
    if (age <= this.ttl) {
      entry.accessCount++;
      return entry.value;
    }

    // Если данные устарели, но все еще в пределах staleTtl и allowStale=true
    if (allowStale && age <= this.staleTtl) {
      entry.isStale = true;
      return entry.value;
    }

    // Данные слишком старые, удаляем их
    this.cache.delete(key);
    this.priorities.delete(key);
    return null;
  }

  clearExpired() {
    const now = Date.now();
    this.lastCleanup = now;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.staleTtl) {
        this.cache.delete(key);
        this.priorities.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.priorities.clear();
    this.lastCleanup = Date.now();
  }
}

class RequestQueue {
  constructor() {
    this.queue = new Map();
    this.processing = new Set();
    this.waitingQueue = [];
    this.maxConcurrent = 4; // Максимальное количество параллельных запросов
  }

  async enqueue(key, requestFn, priority = CONFIG.PRIORITIES.DEFAULT) {
    // Дедупликация запросов
    if (this.queue.has(key)) {
      return this.queue.get(key);
    }

    const promise = new Promise((resolve, reject) => {
      this.waitingQueue.push({
        key,
        requestFn,
        priority,
        resolve,
        reject,
        timestamp: Date.now(),
      });
    });

    this.queue.set(key, promise);

    // Сортируем очередь по приоритету и времени
    this.waitingQueue.sort(
      (a, b) => b.priority - a.priority || a.timestamp - b.timestamp
    );

    // Запускаем обработку очереди, если есть свободные слоты
    if (this.processing.size < this.maxConcurrent) {
      this.processQueue();
    }

    return promise;
  }

  async processQueue() {
    if (
      this.waitingQueue.length === 0 ||
      this.processing.size >= this.maxConcurrent
    ) {
      return;
    }

    const item = this.waitingQueue.shift();
    if (!item) return;

    try {
      this.processing.add(item.key);
      const result = await item.requestFn();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.processing.delete(item.key);
      this.queue.delete(item.key);

      // Продолжаем обработку очереди
      this.processQueue();
    }
  }

  clear() {
    this.queue.clear();
    this.processing.clear();
    this.waitingQueue = [];
  }
}

class RateLimiter {
  constructor(
    maxRequests = CONFIG.RATE_LIMIT.MAX_REQUESTS,
    timeWindow = CONFIG.RATE_LIMIT.TIME_WINDOW,
    burstLimit = CONFIG.RATE_LIMIT.BURST_LIMIT
  ) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.burstLimit = burstLimit;
    this.backoffTime = CONFIG.RATE_LIMIT.MIN_BACKOFF;
    this.priorityQueue = new Map();
    this.lastCleanup = Date.now();
  }

  async checkLimit(key, priority = CONFIG.PRIORITIES.DEFAULT) {
    const now = Date.now();

    // Периодическая очистка старых записей
    if (now - this.lastCleanup > this.timeWindow) {
      this.cleanup(now);
    }

    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(
      (time) => now - time < this.timeWindow
    );

    // Приоритетные запросы могут превышать обычный лимит
    if (
      priority > CONFIG.PRIORITIES.DEFAULT &&
      validTimestamps.length < this.burstLimit
    ) {
      validTimestamps.push(now);
      this.requests.set(key, validTimestamps);
      return true;
    }

    if (validTimestamps.length >= this.maxRequests) {
      const waitTime = Math.max(
        this.timeWindow - (now - validTimestamps[0]),
        this.backoffTime
      );

      await this.queueRequest(key, priority, waitTime);
      return this.checkLimit(key, priority);
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  async queueRequest(key, priority, waitTime) {
    return new Promise((resolve) => {
      const queueKey = `${key}_${priority}`;
      if (!this.priorityQueue.has(queueKey)) {
        this.priorityQueue.set(queueKey, []);
      }
      this.priorityQueue.get(queueKey).push(resolve);

      setTimeout(() => {
        const resolvers = this.priorityQueue.get(queueKey) || [];
        const resolver = resolvers.shift();
        if (resolver) resolver();
        if (resolvers.length === 0) {
          this.priorityQueue.delete(queueKey);
        }
      }, waitTime / priority);
    });
  }

  cleanup(now) {
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (time) => now - time < this.timeWindow
      );
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
    this.lastCleanup = now;
  }

  increaseBackoff() {
    this.backoffTime = Math.min(
      this.backoffTime * 2,
      CONFIG.RATE_LIMIT.MAX_BACKOFF
    );
  }

  resetBackoff() {
    this.backoffTime = CONFIG.RATE_LIMIT.MIN_BACKOFF;
  }

  clear() {
    this.requests.clear();
    this.priorityQueue.clear();
    this.resetBackoff();
    this.lastCleanup = Date.now();
  }
}

// Создаем экземпляры менеджеров
const cache = new CacheManager();
const rateLimiter = new RateLimiter();
const requestQueue = new RequestQueue();

// Создаем инстанс axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  timeout: CONFIG.REQUEST.TIMEOUT,
  maxRedirects: CONFIG.REQUEST.MAX_REDIRECTS,
  maxContentLength: CONFIG.REQUEST.MAX_CONTENT_LENGTH,
  decompress: true,
});

// Утилитарные функции
const delay = (retryCount) => {
  const baseDelay = CONFIG.RATE_LIMIT.MIN_BACKOFF;
  const expDelay = Math.min(
    baseDelay * Math.pow(2, retryCount - 1),
    CONFIG.RATE_LIMIT.MAX_BACKOFF
  );
  return expDelay + Math.random() * (expDelay * 0.1); // 10% jitter
};

const getRequestPriority = (config) => {
  if (config.url.includes("/categories")) return CONFIG.PRIORITIES.CATEGORIES;
  if (config.url.includes("/products")) return CONFIG.PRIORITIES.PRODUCTS;
  return CONFIG.PRIORITIES.DEFAULT;
};

// Обработчик запросов с поддержкой повторных попыток и rate limiting
const handleRequest = async (config) => {
  const priority = getRequestPriority(config);
  const requestKey = `${config.method}_${config.url}`;

  return requestQueue.enqueue(
    requestKey,
    async () => {
      await rateLimiter.checkLimit(requestKey, priority);
      try {
        const response = await axios(config);
        rateLimiter.resetBackoff();
        return response;
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimiter.increaseBackoff();
          const retryAfter =
            parseInt(error.response.headers["retry-after"]) * 1000 ||
            rateLimiter.backoffTime;
          await new Promise((resolve) => setTimeout(resolve, retryAfter));
          return handleRequest(config);
        }
        throw error;
      }
    },
    priority
  );
};

// Интерцепторы запросов и ответов
api.interceptors.request.use(
  async (config) => {
    config.retryCount = 0;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || config.retryCount >= CONFIG.REQUEST.MAX_RETRIES) {
      return Promise.reject(error);
    }

    config.retryCount = (config.retryCount || 0) + 1;

    if (
      error.response?.status === 429 ||
      error.response?.status >= 500 ||
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK"
    ) {
      const waitTime = delay(config.retryCount);
      console.log(`Retry attempt ${config.retryCount} for ${config.url}`, {
        status: error.response?.status,
        error: error.message,
        retryDelay: waitTime,
      });

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return handleRequest(config);
    }

    return Promise.reject(error);
  }
);

// Функции для работы с кешем и запросами
const getCacheKey = (url, params = {}) => {
  const sortedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return `${url}?${new URLSearchParams(sortedParams).toString()}`;
};

const cacheRequest = async (
  url,
  params = {},
  priority = CONFIG.PRIORITIES.DEFAULT
) => {
  const cacheKey = getCacheKey(url, params);
  const cachedData = cache.get(cacheKey);

  if (cachedData && !cachedData.isStale) {
    return cachedData;
  }

  try {
    const response = await handleRequest({
      method: "get",
      url,
      params,
    });

    if (response.data) {
      cache.set(cacheKey, response.data, priority);
      return response.data;
    }

    throw new Error("Empty response data");
  } catch (error) {
    console.error(`Request error for ${url}:`, {
      params,
      status: error.response?.status,
      message: error.message,
    });

    // Возвращаем устаревшие данные в случае ошибки
    if (cachedData) {
      console.log("Returning stale cached data while fetching failed");
      return cachedData;
    }

    throw error;
  }
};

// API функции
export const fetchCategories = async () => {
  try {
    return await cacheRequest(
      `${API_URL}/categories`,
      {},
      CONFIG.PRIORITIES.CATEGORIES
    );
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
    const url = `${API_URL}/categories/${categoryShortName}${
      childCategoryShortName ? `/${childCategoryShortName}` : ""
    }`;

    const params = { page, limit };
    const data = await cacheRequest(url, params, CONFIG.PRIORITIES.PRODUCTS);

    // Нормализация ответа
    const normalized = normalizeProductResponse(data);
    return normalized;
  } catch (error) {
    console.error("Error fetching products:", {
      category: categoryShortName,
      subcategory: childCategoryShortName,
      error: error.message,
    });
    throw error;
  }
};

// Функция нормализации ответа для единообразной обработки данных
const normalizeProductResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      products: data,
      totalPages: 1,
      currentPage: 1,
    };
  }

  if (data.categories) {
    return {
      categories: data.categories,
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || 1,
    };
  }

  if (data.products) {
    return {
      products: data.products,
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || 1,
    };
  }

  return {
    products: [],
    totalPages: 0,
    currentPage: 1,
  };
};

export const fetchProductBySlug = async (categoryPath, slug) => {
  if (!categoryPath || !slug) {
    throw new Error("Missing category or product slug");
  }

  const cacheKey = `product_${categoryPath}_${slug}`;
  const cachedProduct = cache.get(cacheKey);

  if (cachedProduct && !cachedProduct.isStale) {
    return cachedProduct;
  }

  try {
    const url = `${API_URL}/products/${categoryPath}/${slug}`;

    // Используем Promise.all для параллельного выполнения запросов
    const [productResponse, categoriesData] = await Promise.all([
      handleRequest({
        method: "get",
        url,
      }),
      // Используем уже закешированные категории или загружаем новые
      cache.get("categories") || fetchCategories(),
    ]);

    const productData = enrichProductData(
      productResponse.data,
      categoriesData,
      categoryPath
    );

    cache.set(cacheKey, productData, CONFIG.PRIORITIES.PRODUCTS);
    return productData;
  } catch (error) {
    console.error("Error fetching product details:", {
      categoryPath,
      slug,
      error: error.message,
    });

    // Возвращаем устаревшие данные в случае ошибки
    if (cachedProduct) {
      return cachedProduct;
    }

    throw error;
  }
};

// Функция обогащения данных о продукте информацией о категориях
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

// Механизм предзагрузки данных с поддержкой очереди и приоритетов
class PreloadManager {
  constructor() {
    this.isPreloading = false;
    this.retryTimeout = null;
    this.preloadQueue = new Map();
  }

  async preloadData() {
    if (this.isPreloading) return;
    this.isPreloading = true;

    try {
      // Загружаем категории с высоким приоритетом
      const categories = await fetchCategories();

      // Создаем очередь предзагрузки для каждой категории
      const preloadPromises = categories.map((category) => ({
        priority: CONFIG.PRIORITIES.PRODUCTS,
        promise: () =>
          fetchProducts(category.short_name).catch((error) => {
            console.warn(
              `Failed to preload category ${category.short_name}:`,
              error
            );
            return null;
          }),
      }));

      // Сортируем по приоритету
      preloadPromises.sort((a, b) => b.priority - a.priority);

      // Выполняем предзагрузку последовательно для каждой категории
      for (const { promise } of preloadPromises) {
        await promise();
      }

      console.log("Data successfully preloaded");
    } catch (error) {
      console.error("Preload failed:", error);
      this.scheduleRetry();
    } finally {
      this.isPreloading = false;
    }
  }

  scheduleRetry(attempt = 1) {
    if (attempt > CONFIG.REQUEST.MAX_RETRIES) {
      console.error("Max preload retries exceeded");
      return;
    }

    const retryDelay = delay(attempt);
    this.retryTimeout = setTimeout(() => {
      this.preloadData().catch(() => this.scheduleRetry(attempt + 1));
    }, retryDelay);
  }

  clear() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.preloadQueue.clear();
    this.isPreloading = false;
  }
}

const preloadManager = new PreloadManager();

// Инициализация предзагрузки
const initPreload = () => {
  if (typeof window === "undefined") return;

  const startPreload = () => {
    // Начинаем предзагрузку с небольшой задержкой после загрузки страницы
    setTimeout(() => {
      preloadManager.preloadData().catch((error) => {
        console.warn("Initial preload failed:", error);
      });
    }, 1000);
  };

  if (document.readyState === "complete") {
    startPreload();
  } else {
    window.addEventListener("load", startPreload);
  }
};

initPreload();

class AuthManager {
  constructor() {
    this.tokenRefreshPromise = null;
    this.authQueue = new Map();
    this.rateLimiter = new RateLimiter(
      CONFIG.AUTH.AUTH_RATE_LIMIT.MAX_REQUESTS,
      CONFIG.AUTH.AUTH_RATE_LIMIT.TIME_WINDOW
    );
    this.onLogoutCallbacks = new Set();
  }

  async handleAuthRequest(requestFn, retryCount = 0) {
    const requestKey = `auth_${Date.now()}`;

    try {
      await this.rateLimiter.checkLimit(requestKey, CONFIG.PRIORITIES.AUTH);

      return await requestQueue.enqueue(
        requestKey,
        async () => {
          try {
            return await requestFn();
          } catch (error) {
            if (
              error.response?.status === 429 &&
              retryCount < CONFIG.AUTH.MAX_AUTH_RETRIES
            ) {
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * (retryCount + 1))
              );
              return this.handleAuthRequest(requestFn, retryCount + 1);
            }
            throw error;
          }
        },
        CONFIG.PRIORITIES.AUTH
      );
    } catch (error) {
      console.error("Auth request failed:", error);
      throw error;
    }
  }

  getToken() {
    return localStorage.getItem("token");
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      this.clearToken();
    }
  }

  clearToken() {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }

  async refreshTokenIfNeeded() {
    const token = this.getToken();
    if (!token) return;

    try {
      // Добавить проверку времени жизни токена
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const expiresIn = tokenData.exp * 1000 - Date.now();

      if (expiresIn < CONFIG.AUTH.TOKEN_REFRESH_THRESHOLD) {
        if (!this.tokenRefreshPromise) {
          this.tokenRefreshPromise = this.handleAuthRequest(async () => {
            const response = await api.post("/auth/refresh");
            this.setToken(response.data.token);
            return response.data;
          });
        }
        await this.tokenRefreshPromise;
      }
    } catch (error) {
      console.warn("Token refresh failed:", error);
      this.clearToken();
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  addLogoutCallback(callback) {
    this.onLogoutCallbacks.add(callback);
  }

  removeLogoutCallback(callback) {
    this.onLogoutCallbacks.delete(callback);
  }

  async performLogout() {
    try {
      await this.handleAuthRequest(async () => {
        return await api.post("/auth/logout");
      });
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      // Выполняем все колбэки при выходе
      for (const callback of this.onLogoutCallbacks) {
        try {
          await callback();
        } catch (error) {
          console.error("Error in logout callback:", error);
        }
      }
      this.clearToken();
    }
  }
}

const authManager = new AuthManager();

// Обновляем функции авторизации
export const register = async (userData) => {
  try {
    const response = await authManager.handleAuthRequest(async () => {
      return await api.post("/auth/register", userData);
    });
    authManager.setToken(response.data.token);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Ошибка при регистрации";
    throw new Error(message);
  }
};

export const login = async (credentials) => {
  try {
    const response = await authManager.handleAuthRequest(async () => {
      return await api.post("/auth/login", credentials);
    });
    authManager.setToken(response.data.token);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Ошибка при входе";
    throw new Error(message);
  }
};

// Обновляем интерцепторы
api.interceptors.request.use(
  async (config) => {
    // Проверяем необходимость обновления токена перед каждым запросом
    if (config.url.includes("/auth/")) {
      await authManager.refreshTokenIfNeeded();
    }

    const token = authManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      authManager.clearToken();
      // Редирект только если это не запрос аутентификации
      if (!error.config.url.includes("/auth/")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

class ProfileManager {
  constructor() {
    this.profileCache = null;
    this.lastFetch = null;
    this.pendingUpdates = new Map();
    this.updateTimeout = null;
    this.fetchPromise = null;
    authManager.addLogoutCallback(() => {
      this.invalidateCache();
    });
  }

  async getProfile(forceFetch = false) {
    // Если есть активный запрос на получение профиля, ждем его
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    // Проверяем кеш
    if (
      !forceFetch &&
      this.profileCache &&
      this.lastFetch &&
      Date.now() - this.lastFetch < CONFIG.PROFILE.CACHE_TTL
    ) {
      return this.profileCache;
    }

    try {
      this.fetchPromise = requestQueue.enqueue(
        "get_profile",
        async () => {
          const response = await api.get("/auth/profile");
          this.profileCache = response.data;
          this.lastFetch = Date.now();
          return this.profileCache;
        },
        CONFIG.PRIORITIES.PROFILE
      );

      return await this.fetchPromise;
    } catch (error) {
      // Если есть кешированный профиль, возвращаем его при ошибке
      if (this.profileCache) {
        console.warn("Failed to fetch fresh profile, using cached version");
        return this.profileCache;
      }
      throw error;
    } finally {
      this.fetchPromise = null;
    }
  }

  async updateProfile(updates, immediate = false) {
    // Добавляем обновления в очередь
    Object.entries(updates).forEach(([key, value]) => {
      this.pendingUpdates.set(key, value);
    });

    // Если требуется немедленное обновление или это первое обновление
    if (immediate || this.pendingUpdates.size === 1) {
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }
      return this.flushUpdates();
    }

    // Иначе запускаем отложенное обновление
    if (!this.updateTimeout) {
      this.updateTimeout = setTimeout(
        () => this.flushUpdates(),
        CONFIG.PROFILE.BATCH_UPDATE_DELAY
      );
    }
  }

  async flushUpdates() {
    if (this.pendingUpdates.size === 0) return;

    const updates = Object.fromEntries(this.pendingUpdates);
    this.pendingUpdates.clear();

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    let retryCount = 0;
    while (retryCount <= CONFIG.PROFILE.MAX_RETRIES) {
      try {
        const response = await requestQueue.enqueue(
          "update_profile",
          async () => {
            return await api.put("/auth/profile", updates);
          },
          CONFIG.PRIORITIES.PROFILE
        );

        // Обновляем кеш
        this.profileCache = response.data;
        this.lastFetch = Date.now();
        return response.data;
      } catch (error) {
        if (retryCount === CONFIG.PROFILE.MAX_RETRIES) {
          throw error;
        }
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }

  invalidateCache() {
    this.profileCache = null;
    this.lastFetch = null;
  }
}

const profileManager = new ProfileManager();

// Обновляем экспортируемые функции для работы с профилем
export const getProfile = async (forceFetch = false) => {
  try {
    return await profileManager.getProfile(forceFetch);
  } catch (error) {
    const message =
      error.response?.data?.message || "Ошибка при получении профиля";
    throw new Error(message);
  }
};

export const updateProfile = async (profileData, immediate = false) => {
  try {
    return await profileManager.updateProfile(profileData, immediate);
  } catch (error) {
    const message =
      error.response?.data?.message || "Ошибка при обновлении профиля";
    throw new Error(message);
  }
};

// Добавляем функцию для частичного обновления профиля
export const updateProfileField = async (field, value) => {
  return updateProfile({ [field]: value }, false);
};

export const logout = () => authManager.performLogout();

// Добавляем интерцептор для автоматической инвалидации кеша при ошибках
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      profileManager.invalidateCache();
    }
    return Promise.reject(error);
  }
);

export default api;
