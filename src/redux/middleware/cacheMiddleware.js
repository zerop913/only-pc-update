import { CONFIG } from "../config";

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.priorities = new Map();
    this.lastCleanup = Date.now();
    this.pendingRequests = new Map();
  }

  setPriority(key, priority) {
    this.priorities.set(key, priority);
  }

  getCacheKey(type, params = {}) {
    return `${type}_${JSON.stringify(params)}`;
  }

  set(key, value, priority = CONFIG.PRIORITIES.DEFAULT) {
    if (this.cache.size >= CONFIG.CACHE.MAX_SIZE) {
      this.evictLowPriorityItems();
    }

    const entry = {
      value,
      timestamp: Date.now(),
      accessCount: 0,
      priority,
      isStale: false,
    };

    this.cache.set(key, entry);
    this.setPriority(key, priority);

    // Сохраняем в sessionStorage для персистентности между обновлениями страницы
    try {
      sessionStorage.setItem(
        `cache_${key}`,
        JSON.stringify({ ...entry, value })
      );
    } catch (error) {
      console.warn("Failed to save to sessionStorage:", error);
    }
  }

  get(key, allowStale = true) {
    // Сначала проверяем память
    let entry = this.cache.get(key);

    // Если нет в памяти, пробуем получить из sessionStorage
    if (!entry) {
      try {
        const stored = sessionStorage.getItem(`cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          this.cache.set(key, entry);
        }
      } catch (error) {
        console.warn("Failed to read from sessionStorage:", error);
      }
    }

    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age <= CONFIG.CACHE.TTL) {
      entry.accessCount++;
      return entry.value;
    }

    if (allowStale && age <= CONFIG.CACHE.STALE_TTL) {
      entry.isStale = true;
      return entry.value;
    }

    // Удаляем устаревшие данные
    this.cache.delete(key);
    this.priorities.delete(key);
    try {
      sessionStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn("Failed to remove from sessionStorage:", error);
    }
    return null;
  }

  async getOrSet(key, fetchFn, priority = CONFIG.PRIORITIES.DEFAULT) {
    // Проверяем наличие данных в кеше
    const cachedData = this.get(key, key.includes("favorites"));
    if (cachedData) return cachedData;

    // Проверяем, нет ли уже выполняющегося запроса
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Создаем новый запрос
    const request = fetchFn()
      .then((data) => {
        // Для избранного используем более длительное кэширование
        const effectivePriority = key.includes("favorites")
          ? CONFIG.PRIORITIES.PROFILE
          : priority;

        this.set(key, data, effectivePriority);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  clear() {
    this.cache.clear();
    this.priorities.clear();
    this.lastCleanup = Date.now();
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("cache_")) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear sessionStorage:", error);
    }
  }

  evictLowPriorityItems() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      const priorityA = this.priorities.get(a[0]) || 0;
      const priorityB = this.priorities.get(b[0]) || 0;
      return priorityA - priorityB;
    });

    // Удаляем 20% кеша с наименьшим приоритетом
    const itemsToRemove = Math.ceil(this.cache.size * 0.2);
    entries.slice(0, itemsToRemove).forEach(([key]) => {
      this.cache.delete(key);
      this.priorities.delete(key);
      try {
        sessionStorage.removeItem(`cache_${key}`);
      } catch (error) {
        console.warn("Failed to remove from sessionStorage:", error);
      }
    });
  }
}

const cacheManager = new CacheManager();

export const cacheMiddleware = (store) => (next) => (action) => {
  if (!action.meta?.cache) {
    return next(action);
  }

  const { type, meta, payload } = action;
  const cacheKey = cacheManager.getCacheKey(
    meta.cacheKey || type,
    meta.cacheParams || payload
  );
  const cachePriority = meta.priority || CONFIG.PRIORITIES.DEFAULT;

  return cacheManager.getOrSet(cacheKey, () => next(action), cachePriority);
};

export { cacheManager };
