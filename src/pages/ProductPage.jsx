import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import Header from "../components/Header/Header";
import ProductInfo from "../components/Products/ProductInfo";
import ProductCharacteristics from "../components/Products/ProductCharacteristics";
import Breadcrumbs from "../components/UI/Breadcrumbs";
import useSessionStorage from "../hooks/useSessionStorage";

const ProductPage = () => {
  const { categories, childCategories, slug } = useParams();
  const navigate = useNavigate();
  const { currentProduct, loading, error, fetchProduct } = useProducts();
  const { categories: categoriesData } = useCategories();
  const characteristicsRef = useRef(null);
  const [navigationInProgress, setNavigationInProgress] = useSessionStorage(
    "navigationInProgress",
    false
  );
  const navigationTimeoutRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      const categoryPath = childCategories
        ? `${categories}/${childCategories}`
        : categories;

      await fetchProduct({
        categoryPath,
        slug,
      });
    };

    loadProduct();

    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      setNavigationInProgress(false);
    };
  }, [
    categories,
    childCategories,
    slug,
    fetchProduct,
    setNavigationInProgress,
  ]);

  const handleBreadcrumbClick = (e, path) => {
    e.preventDefault();
    setNavigationInProgress(true);

    const lastPath =
      sessionStorage.getItem(`lastPath_${path.replace(/^\//, "")}`) ||
      `${path}#page=1`;

    navigationTimeoutRef.current = setTimeout(() => {
      navigate(lastPath, { replace: true });
    }, 50);
  };

  if (navigationInProgress) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <motion.div
            className="w-12 h-12 border-4 border-[#E0E1E6] rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </>
    );
  }

  if (error || !currentProduct) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)] text-red-500">
          {error || "Товар не найден"}
        </div>
      </>
    );
  }

  const scrollToCharacteristics = () => {
    characteristicsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <Header />
      <Helmet>
        <title>{currentProduct?.name || "Загрузка..."}</title>
      </Helmet>

      <motion.div
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Breadcrumbs
          mainCategory={currentProduct.category}
          subCategory={currentProduct.subcategory}
          productName={currentProduct.name}
          onBreadcrumbClick={handleBreadcrumbClick}
        />

        <div className="space-y-8 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <ProductInfo
              product={currentProduct}
              onShowAllCharacteristics={scrollToCharacteristics}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <ProductCharacteristics
              ref={characteristicsRef}
              characteristics={currentProduct.characteristics}
            />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductPage;
