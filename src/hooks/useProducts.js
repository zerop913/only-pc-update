import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchProductBySlug,
} from "../redux/features/products/productsThunks";

export const useProducts = () => {
  const dispatch = useDispatch();
  const {
    items: products,
    currentProduct,
    loading,
    error,
    totalPages,
    currentPage,
  } = useSelector((state) => state.products);

  const fetchProductsData = useCallback(
    async (params) => {
      try {
        await dispatch(fetchProducts(params)).unwrap();
      } catch (err) {
        return null;
      }
    },
    [dispatch]
  );

  const fetchProduct = useCallback(
    async (params) => {
      try {
        await dispatch(fetchProductBySlug(params)).unwrap();
      } catch (err) {
        return null;
      }
    },
    [dispatch]
  );

  return {
    products,
    currentProduct,
    loading,
    error,
    totalPages,
    currentPage,
    fetchProducts: fetchProductsData,
    fetchProduct,
  };
};
