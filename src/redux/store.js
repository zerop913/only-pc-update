import { configureStore } from "@reduxjs/toolkit";
import { cacheMiddleware } from "./middleware/cacheMiddleware";
import { rateLimitMiddleware } from "./middleware/rateLimitMiddleware";
import { authMiddleware, authManager } from "./middleware/authMiddleware";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { authReducer } from "./features/auth/authSlice";
import { categoriesReducer } from "./features/categories/categoriesSlice";
import { productsReducer } from "./features/products/productsSlice";
import { profileReducer } from "./features/profile/profileSlice";
import { favoritesReducer } from "./features/favorites/favoritesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    products: productsReducer,
    profile: profileReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      cacheMiddleware,
      rateLimitMiddleware,
      authMiddleware,
      errorMiddleware,
    ]),
});

authManager.initializeAuth(store);

export { store };
