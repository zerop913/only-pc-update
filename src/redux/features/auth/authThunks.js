import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { CONFIG } from "../../config";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token } = response.data;

      if (!token) {
        return rejectWithValue("Токен не получен");
      }

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return response.data;
    } catch (error) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];

      if (error.response?.status === 429) {
        return rejectWithValue(
          "Слишком много попыток входа. Пожалуйста, подождите немного и попробуйте снова."
        );
      }

      return rejectWithValue(
        error.response?.data?.message || "Неверный логин или пароль"
      );
    }
  },
  {
    meta: {
      rateLimit: true,
      priority: CONFIG.PRIORITIES.AUTH,
    },
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при регистрации"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при выходе"
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/refresh");
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при обновлении токена"
      );
    }
  }
);
