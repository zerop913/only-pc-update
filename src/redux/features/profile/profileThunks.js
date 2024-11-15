import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { CONFIG } from "../../config";

let profileRequest = null;

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (forceFetch = false, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Не авторизован");
      }

      // Предотвращаем множественные запросы
      if (profileRequest) {
        return profileRequest;
      }

      // Создаем новый запрос
      profileRequest = api.get("/auth/profile").then((response) => {
        profileRequest = null;
        return response.data;
      });

      return await profileRequest;
    } catch (error) {
      profileRequest = null;
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        return rejectWithValue("Сессия истекла");
      }
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при получении профиля"
      );
    }
  },
  {
    condition: (forceFetch, { getState }) => {
      if (forceFetch) return true;

      const token = localStorage.getItem("token");
      if (!token) return false;

      const { profile } = getState();
      if (profile.loading) return false;

      const lastUpdated = profile.lastUpdated;
      return (
        !lastUpdated || Date.now() - lastUpdated >= CONFIG.PROFILE.CACHE_TTL
      );
    },
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await api.put("/auth/profile", updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при обновлении профиля"
      );
    }
  }
);

export const updateProfileField = createAsyncThunk(
  "profile/updateProfileField",
  async ({ field, value }, { dispatch }) => {
    const updateData = { [field]: value };
    return dispatch(updateProfile(updateData)).unwrap();
  },
  {
    meta: {
      priority: CONFIG.PRIORITIES.PROFILE,
    },
  }
);

export const batchUpdateProfile = createAsyncThunk(
  "profile/batchUpdate",
  async (updates, { dispatch }) => {
    try {
      const result = await dispatch(updateProfile(updates)).unwrap();
      // Сразу обновляем данные профиля после успешного сохранения
      await dispatch(fetchProfile(true));
      return result;
    } catch (error) {
      throw error;
    }
  },
  {
    meta: {
      priority: CONFIG.PRIORITIES.PROFILE,
    },
  }
);
