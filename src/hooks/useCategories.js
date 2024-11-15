import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../redux/features/categories/categoriesThunks";

export const useCategories = () => {
  const dispatch = useDispatch();
  const {
    items: categories,
    loading,
    error,
  } = useSelector((state) => state.categories);

  const fetchCategoriesData = useCallback(async () => {
    try {
      await dispatch(fetchCategories()).unwrap();
    } catch (err) {
      return null;
    }
  }, [dispatch]);

  const findCategoryByPath = useCallback(
    (path) => {
      if (!path || !categories.length)
        return { mainCategory: null, subCategory: null };

      const [mainCategorySlug, subCategorySlug] = path
        .split("/")
        .filter(Boolean);

      const mainCategory = categories.find(
        (cat) => cat.short_name === mainCategorySlug
      );

      let subCategory = null;
      if (mainCategory && subCategorySlug) {
        subCategory = mainCategory.children?.find(
          (sub) => sub.short_name === subCategorySlug
        );
      }

      return { mainCategory, subCategory };
    },
    [categories]
  );

  useEffect(() => {
    if (!categories.length) {
      fetchCategoriesData();
    }
  }, [categories.length, fetchCategoriesData]);

  return {
    categories,
    loading,
    error,
    refetchCategories: fetchCategoriesData,
    findCategoryByPath,
  };
};
