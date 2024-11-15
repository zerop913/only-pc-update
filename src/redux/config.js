export const CONFIG = {
  CACHE: {
    MAX_SIZE: 500, // Увеличиваем размер кеша
    TTL: 30 * 60 * 1000, // 30 минут
    STALE_TTL: 60 * 60 * 1000, // 1 час для устаревших данных
  },
  RATE_LIMIT: {
    MAX_REQUESTS: 20, // Увеличиваем максимальное количество запросов
    TIME_WINDOW: 60000, // 1 минута
    BURST_LIMIT: 30, // Увеличиваем лимит для пакетных запросов
    MIN_BACKOFF: 500,
    MAX_BACKOFF: 5000,
  },
  REQUEST: {
    TIMEOUT: 15000, // Уменьшаем timeout до 15 секунд
    MAX_RETRIES: 2,
    MAX_REDIRECTS: 5,
    MAX_CONTENT_LENGTH: 50 * 1024 * 1024,
  },
  PRIORITIES: {
    AUTH: 3,
    PROFILE: 2.5,
    CATEGORIES: 3, // Повышаем приоритет категорий
    PRODUCTS: 2,
    DEFAULT: 1,
  },
  AUTH: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000,
    MAX_AUTH_RETRIES: 2,
    AUTH_QUEUE_TIMEOUT: 10000,
    AUTH_RATE_LIMIT: {
      MAX_REQUESTS: 5,
      TIME_WINDOW: 60 * 1000, // 1 минута
    },
  },
  PROFILE: {
    CACHE_TTL: 5 * 60 * 1000,
    MAX_RETRIES: 2,
    BATCH_UPDATE_DELAY: 1000,
  },
};
