import { createSlice } from "@reduxjs/toolkit";
import {
  addToFavorites,
  removeFromFavorites,
  fetchFavorites,
  checkFavoriteStatus,
} from "./favoritesThunks";

const initialState = {
  items: [],
  loading: false,
  error: null,
  favoriteProductIds: [],
  totalPages: 1,
  currentPage: 1,
  lastUpdated: null,
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavoritesError: (state) => {
      state.error = null;
    },
    resetFavorites: (state) => {
      state.items = [];
      state.favoriteProductIds = [];
      state.totalPages = 1;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Добавление в избранное
      .addCase(addToFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.productId) {
          state.favoriteProductIds.push(action.payload.productId);
        }
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Удаление из избранного
      .addCase(removeFromFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favoriteProductIds = state.favoriteProductIds.filter(
          (id) => id !== action.payload.productId
        );
        state.items = state.items.filter(
          (item) => item.id !== action.payload.productId
        );
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Получение избранных товаров
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || action.payload;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })

      // Проверка статуса избранного
      .addCase(checkFavoriteStatus.fulfilled, (state, action) => {
        state.favoriteProductIds = action.payload.favoriteProductIds;
      });
  },
});

export const { clearFavoritesError, resetFavorites } = favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;
