import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { fetchProductBySlug, fetchCategories } from "../api";
import Header from "../components/Header/Header";
import ProductInfo from "../components/Products/ProductInfo";
import ProductCharacteristics from "../components/Products/ProductCharacteristics";
import Breadcrumbs from "../components/UI/Breadcrumbs";

const ProductPage = () => {
  const { categories, childCategories, slug } = useParams();
  const [product, setProduct] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const categoriesData = await fetchCategories();
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

        const categoryPath = childCategories
          ? `${categories}/${childCategories}`
          : categories;
        const productData = await fetchProductBySlug(categoryPath, slug);
        setProduct(productData);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categories, childCategories, slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E0E1E6]"></div>
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

  return (
    <>
      <Header />
      <Helmet>
        <title>{product.name}</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          mainCategory={categoryData.mainCategory}
          subCategory={categoryData.subCategory}
          productName={product.name}
        />

        <div className="space-y-8 mt-6">
          <ProductInfo product={product} />

          <ProductCharacteristics characteristics={product.characteristics} />
        </div>
      </div>
    </>
  );
};

export default ProductPage;
