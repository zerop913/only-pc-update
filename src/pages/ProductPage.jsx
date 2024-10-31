import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { fetchProductBySlug, fetchCategories } from "../api";
import Header from "../components/Header/Header";
import ProductInfo from "../components/Products/ProductInfo";
import ProductCharacteristics from "../components/Products/ProductCharacteristics";
import Breadcrumbs from "../components/UI/Breadcrumbs";

const ProductPage = ({
  product: initialProduct,
  categoryData: initialCategoryData,
  onBreadcrumbClick,
}) => {
  const { categories, childCategories, slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(initialProduct || null);
  const [categoryData, setCategoryData] = useState(initialCategoryData || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const characteristicsRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (initialProduct && initialCategoryData) return;

      try {
        setLoading(true);
        const [categoriesData, productData] = await Promise.all([
          fetchCategories(),
          fetchProductBySlug(
            childCategories ? `${categories}/${childCategories}` : categories,
            slug
          ),
        ]);

        const mainCategory = categoriesData.find(
          (cat) => cat.short_name === categories
        );
        let subCategory = null;
        if (childCategories && mainCategory?.children) {
          subCategory = mainCategory.children.find(
            (child) => child.short_name === childCategories
          );
        }

        setCategoryData({ mainCategory, subCategory });
        setProduct(productData);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categories, childCategories, slug, initialProduct, initialCategoryData]);

  const handleBreadcrumbClick = (e, path) => {
    e.preventDefault();

    // Получаем сохраненный путь с номером страницы
    const lastPath =
      localStorage.getItem(`lastPath_${path.replace(/^\//, "")}`) ||
      `${path}#page=1`;

    navigate(lastPath, { replace: true });
  };

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

  if (error || !product || !categoryData) {
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
        <title>{product?.name || "Загрузка..."}</title>
      </Helmet>

      <motion.div
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Breadcrumbs
          mainCategory={categoryData.mainCategory}
          subCategory={categoryData.subCategory}
          productName={product.name}
          onBreadcrumbClick={handleBreadcrumbClick}
        />

        <div className="space-y-8 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <ProductInfo
              product={product}
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
              characteristics={product.characteristics}
            />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductPage;
