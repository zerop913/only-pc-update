import { createSlice } from "@reduxjs/toolkit";
import { fetchCategories } from "./categoriesThunks";

const initialState = {
  items: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoriesError } = categoriesSlice.actions;
export const categoriesReducer = categoriesSlice.reducer;
