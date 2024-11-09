export const ROUTES = {
  HOME: "/",
  CATEGORY: "/:categoryShortName",
  SUBCATEGORY: "/:categoryShortName/:subcategoryShortName",
  PRODUCT: "/products/:categories/:slug",
  PRODUCT_CHILD: "/products/:categories/:childCategories/:slug",
  AUTH: "/auth",
  REGISTER: "/register",
  PROFILE: "/profile",
  NOT_FOUND: "*",
};
