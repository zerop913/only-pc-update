import { CONFIG } from "../config";

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.backoffTime = CONFIG.RATE_LIMIT.MIN_BACKOFF;
    this.priorityQueue = new Map();
    this.lastCleanup = Date.now();
    this.authAttempts = new Map();
  }

  cleanupOldRequests() {
    const now = Date.now();
    if (now - this.lastCleanup > CONFIG.RATE_LIMIT.TIME_WINDOW) {
      this.requests.clear();
      this.authAttempts.clear();
      this.lastCleanup = now;
    }
  }

  async checkLimit(key, priority = CONFIG.PRIORITIES.DEFAULT, isAuth = false) {
    this.cleanupOldRequests();
    const now = Date.now();

    if (isAuth) {
      const authTimestamps = this.authAttempts.get(key) || [];
      const validAuthTimestamps = authTimestamps.filter(
        (time) => now - time < CONFIG.AUTH.AUTH_RATE_LIMIT.TIME_WINDOW
      );

      if (
        validAuthTimestamps.length >= CONFIG.AUTH.AUTH_RATE_LIMIT.MAX_REQUESTS
      ) {
        const waitTime = Math.max(
          CONFIG.AUTH.AUTH_RATE_LIMIT.TIME_WINDOW -
            (now - validAuthTimestamps[0]),
          this.backoffTime
        );
        await this.queueRequest(key, priority, waitTime);
        return this.checkLimit(key, priority, isAuth);
      }

      validAuthTimestamps.push(now);
      this.authAttempts.set(key, validAuthTimestamps);
      return true;
    }

    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(
      (time) => now - time < CONFIG.RATE_LIMIT.TIME_WINDOW
    );

    if (validTimestamps.length >= CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      const waitTime = Math.max(
        CONFIG.RATE_LIMIT.TIME_WINDOW - (now - validTimestamps[0]),
        this.backoffTime
      );
      await this.queueRequest(key, priority, waitTime);
      return this.checkLimit(key, priority, isAuth);
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  async queueRequest(key, priority, waitTime) {
    const adjustedWaitTime = Math.min(
      waitTime / Math.max(priority, 1),
      CONFIG.RATE_LIMIT.MAX_BACKOFF
    );
    return new Promise((resolve) => {
      setTimeout(resolve, adjustedWaitTime);
    });
  }
}

const rateLimiter = new RateLimiter();

export const rateLimitMiddleware = (store) => (next) => async (action) => {
  if (!action.meta?.rateLimit) {
    return next(action);
  }

  const priority = action.meta.priority || CONFIG.PRIORITIES.DEFAULT;
  const isAuth = action.type.startsWith("auth/");
  const key = `${action.type}_${Date.now()}`;

  await rateLimiter.checkLimit(key, priority, isAuth);
  return next(action);
};
