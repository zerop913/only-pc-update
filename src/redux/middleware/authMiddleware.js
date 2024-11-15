import { CONFIG } from "../config";
import api from "../services/api";
import { refreshToken } from "../features/auth/authThunks";
import { setAuthenticated } from "../features/auth/authSlice";

class AuthManager {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  initializeAuth(store) {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      store.dispatch(setAuthenticated(true));
    } else if (token) {
      this.clearToken();
      store.dispatch(setAuthenticated(false));
    }
  }

  getToken() {
    return localStorage.getItem("token");
  }

  setToken(token) {
    if (token) {
      try {
        if (!this.isTokenExpired(token)) {
          localStorage.setItem("token", token);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          return true;
        }
      } catch (error) {
        this.clearToken();
      }
    }
    return false;
  }

  clearToken() {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  async handleTokenRefresh(store) {
    try {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        const result = await store.dispatch(refreshToken()).unwrap();
        if (this.setToken(result.token)) {
          this.processQueue(null, result.token);
          return result.token;
        }
        throw new Error("Invalid token received");
      }

      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    } catch (error) {
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  isTokenExpired(token) {
    if (!token) return true;

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      return tokenData.exp * 1000 <= Date.now();
    } catch (error) {
      return true;
    }
  }

  async refreshTokenIfNeeded(store) {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      this.clearToken();
      store.dispatch(setAuthenticated(false));
      return false;
    }

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const expiresIn = tokenData.exp * 1000 - Date.now();

      if (expiresIn < CONFIG.AUTH.TOKEN_REFRESH_THRESHOLD) {
        const newToken = await this.handleTokenRefresh(store);
        return !!newToken;
      }
      return true;
    } catch (error) {
      this.clearToken();
      store.dispatch(setAuthenticated(false));
      return false;
    }
  }
}

const authManager = new AuthManager();

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const store = require("../store").store;
        const token = await authManager.handleTokenRefresh(store);

        if (!token) {
          throw new Error("Failed to refresh token");
        }

        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        authManager.clearToken();
        store.dispatch(setAuthenticated(false));
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

export const authMiddleware = (store) => (next) => async (action) => {
  if (action.meta?.requiresAuth) {
    const isAuthenticated = await authManager.refreshTokenIfNeeded(store);
    if (!isAuthenticated) {
      store.dispatch(setAuthenticated(false));
      return store.dispatch({ type: "auth/logout" });
    }
  }
  return next(action);
};

export { authManager, api };
