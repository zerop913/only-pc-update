import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { CONFIG } from "../../config";

const PROFILE_FETCH_COOLDOWN = 30000;
let lastProfileFetchTimestamp = 0;
let activeProfileRequest = null;

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (forceFetch = false, { rejectWithValue, getState }) => {
    const currentTime = Date.now();
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue("Не авторизован");
    }

    const state = getState();
    const lastUpdated = state.profile.lastUpdated;

    const shouldSkipFetch =
      !forceFetch &&
      lastUpdated &&
      currentTime - lastUpdated < PROFILE_FETCH_COOLDOWN;

    if (shouldSkipFetch) {
      return state.profile.data;
    }

    if (
      !forceFetch &&
      currentTime - lastProfileFetchTimestamp < PROFILE_FETCH_COOLDOWN
    ) {
      return null;
    }

    if (activeProfileRequest) {
      return activeProfileRequest;
    }

    lastProfileFetchTimestamp = currentTime;

    try {
      activeProfileRequest = api
        .get("/auth/profile", {
          timeout: CONFIG.REQUEST.TIMEOUT,
          retry: CONFIG.REQUEST.MAX_RETRIES,
        })
        .then((response) => {
          activeProfileRequest = null;
          return response.data;
        })
        .catch((error) => {
          activeProfileRequest = null;
          throw error;
        });

      return await activeProfileRequest;
    } catch (error) {
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
      const token = localStorage.getItem("token");
      if (!token) return false;

      const { profile } = getState();
      if (profile.loading) return false;

      return (
        forceFetch ||
        !profile.lastUpdated ||
        Date.now() - profile.lastUpdated >= PROFILE_FETCH_COOLDOWN
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
