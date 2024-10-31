import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContextMenu from "./ContextMenu";
import ProductCard from "./ProductCard";
import EmptyCategory from "./EmptyCategory";
import NoCategorySelected from "./NoCategorySelected";
import SelectSubcategory from "./SelectSubcategory";
import ProductPage from "../../pages/ProductPage";
import { fetchProducts, fetchProductBySlug } from "../../api";
import { motion, AnimatePresence } from "framer-motion";

const ProductList = ({
  selectedCategory,
  selectedSubcategory,
  onAddToBuild,
  viewMode,
  setViewMode,
  buildItems,
  onSubcategorySelect,
}) => {
  const [sortBy, setSortBy] = useState("name");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductView, setIsProductView] = useState(false);
  const [pageMemory, setPageMemory] = useState(new Map());
  const itemsPerPage = 50;

  const location = useLocation();
  const navigate = useNavigate();

  const getCategoryKey = useCallback(() => {
    if (!selectedCategory) return null;
    return selectedSubcategory
      ? `${selectedCategory.short_name}/${selectedSubcategory.short_name}`
      : selectedCategory.short_name;
  }, [selectedCategory, selectedSubcategory]);

  useEffect(() => {
    const hash = location.hash;
    const page = parseInt(hash.replace("#page=", ""), 10);
    const categoryKey = getCategoryKey();

    if (!isNaN(page) && page > 0) {
      setCurrentPage(page);
      if (categoryKey) {
        setPageMemory((prev) => new Map(prev).set(categoryKey, page));
      }
    } else if (categoryKey) {
      const savedPage = pageMemory.get(categoryKey) || 1;
      setCurrentPage(savedPage);
      navigate(`${location.pathname}#page=${savedPage}`, { replace: true });
    }
  }, [location.hash, getCategoryKey, navigate]);

  const loadProduct = async (categoryPath, slug) => {
    try {
      const product = await fetchProductBySlug(categoryPath, slug);
      setSelectedProduct(product);
      setIsProductView(true);
    } catch (err) {
      console.error("Ошибка при загрузке товара:", err);
      setError("Не удалось загрузить информацию о товаре");
    }
  };

  const handleProductClick = async (categoryPath, slug) => {
    const currentHash = location.hash;
    const currentPage = currentHash.replace("#page=", "") || "1";

    const categoryKey = getCategoryKey();
    if (categoryKey) {
      setPageMemory((prev) =>
        new Map(prev).set(categoryKey, parseInt(currentPage, 10))
      );
    }

    // Сохраняем полный путь с номером страницы в localStorage
    localStorage.setItem(
      `lastPath_${categoryPath}`,
      `/${categoryPath}${currentHash}`
    );

    navigate(`/products/${categoryPath}/${slug}`, { replace: true });
    await loadProduct(categoryPath, slug);
  };

  const handleBreadcrumbClick = (e, path) => {
    e.preventDefault();
    setIsProductView(false);
    setSelectedProduct(null);

    const pathParts = path.split("/").filter(Boolean);
    const categoryKey = pathParts.join("/");
    const savedPage = pageMemory.get(categoryKey) || 1;
    const newPath = `${path}#page=${savedPage}`;

    navigate(newPath, { replace: true });
  };

  const loadItems = useCallback(async () => {
    if (!selectedCategory) return;

    setLoading(true);
    setError(null);

    try {
      const categoryName = selectedCategory.short_name;
      const subcategoryName = selectedSubcategory
        ? selectedSubcategory.short_name
        : null;

      const response = await fetchProducts(
        categoryName,
        subcategoryName,
        currentPage,
        itemsPerPage
      );

      if (response.categories) {
        setItems(response.categories);
        setTotalPages(response.totalPages);
      } else if (response.products) {
        setItems(response.products);
        setTotalPages(response.totalPages);
      } else {
        setItems([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Ошибка при загрузке элементов:", err);
      setError(
        "Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubcategory, currentPage]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (selectedCategory && !isProductView && !location.hash) {
      setCurrentPage(1);
      const baseUrl = selectedSubcategory
        ? `/${selectedCategory.short_name}/${selectedSubcategory.short_name}`
        : `/${selectedCategory.short_name}`;
      navigate(`${baseUrl}#page=1`, { replace: true });
    }
  }, [
    selectedCategory,
    selectedSubcategory,
    navigate,
    isProductView,
    location.hash,
  ]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const categoryKey = getCategoryKey();
    if (categoryKey) {
      setPageMemory((prev) => new Map(prev).set(categoryKey, newPage));
      const baseUrl = selectedSubcategory
        ? `/${selectedCategory.short_name}/${selectedSubcategory.short_name}`
        : `/${selectedCategory.short_name}`;
      navigate(`${baseUrl}#page=${newPage}`, { replace: true });
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(currentPage + 1, totalPages - 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return (
      <div className="mt-4 flex justify-center space-x-2">
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => page !== "..." && handlePageChange(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? "bg-[#2A2D3E] text-[#E0E1E6]"
                : "bg-[#1D1E2C] text-[#9D9EA6] hover:bg-[#252736] hover:text-[#B8B9C3]"
            } ${page === "..." ? "cursor-default" : "cursor-pointer"}`}
            disabled={page === "..."}
          >
            {page}
          </button>
        ))}
      </div>
    );
  };

  if (!selectedCategory) {
    return <NoCategorySelected />;
  }

  if (loading) {
    return (
      <div className="text-white text-center mt-8">Загрузка элементов...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (isProductView && selectedProduct) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-8"
        >
          <ProductPage
            product={selectedProduct}
            onBreadcrumbClick={handleBreadcrumbClick}
            categoryData={{
              mainCategory: selectedCategory,
              subCategory: selectedSubcategory,
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (
    selectedCategory.children &&
    selectedCategory.children.length > 0 &&
    !selectedSubcategory
  ) {
    return (
      <SelectSubcategory
        subcategories={selectedCategory.children}
        onSubcategorySelect={onSubcategorySelect}
      />
    );
  }

  if (items.length === 0) {
    return <EmptyCategory />;
  }

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") return (a.price || 0) - (b.price || 0);
    return 0;
  });

  const getCategoryPath = () => {
    if (selectedSubcategory) {
      return `${selectedCategory.short_name}/${selectedSubcategory.short_name}`;
    }
    return selectedCategory.short_name;
  };

  return (
    <div>
      <ContextMenu
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <AnimatePresence mode="wait" key={viewMode}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`mt-4 grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {sortedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
              }}
            >
              <ProductCard
                item={item}
                viewMode={viewMode}
                onAddToBuild={onAddToBuild}
                isInBuild={buildItems.some(
                  (buildItem) => buildItem.id === item.id
                )}
                onCategorySelect={onSubcategorySelect}
                categoryPath={getCategoryPath()}
                onProductClick={handleProductClick}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ProductList;
