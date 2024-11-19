import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile, updateProfile } from "./profileThunks";

const initialState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
  isUnauthorized: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
      state.isUnauthorized = false;
    },
    invalidateProfile: (state) => {
      state.lastUpdated = null;
      state.data = null;
      state.isUnauthorized = false;
    },
    resetProfileState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.lastUpdated = null;
      state.isUnauthorized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isUnauthorized = false;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = Date.now();
        state.isUnauthorized = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload?.message || "Ошибка при получении профиля";
        state.isUnauthorized = action.payload?.status === 401;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError, invalidateProfile, resetProfileState } =
  profileSlice.actions;
export const profileReducer = profileSlice.reducer;
