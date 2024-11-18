export const ROUTES = {
  HOME: "/",
  CATEGORY: "/:categoryShortName",
  SUBCATEGORY: "/:categoryShortName/:subcategoryShortName",
  PRODUCT: "/products/:categories/:slug",
  PRODUCT_CHILD: "/products/:categories/:childCategories/:slug",
  AUTH: "/auth",
  REGISTER: "/register",
  PROFILE: "/profile",
  PROFILE_FAVORITES: "/profile/favorites",
  NOT_FOUND: "*",
};
