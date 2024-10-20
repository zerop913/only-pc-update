import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContextMenu from "./ContextMenu";
import ProductCard from "./ProductCard";
import EmptyCategory from "./EmptyCategory";
import NoCategorySelected from "./NoCategorySelected";
import SelectSubcategory from "./SelectSubcategory";
import { fetchProducts } from "../../api";

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
  const itemsPerPage = 50;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = location.hash;
    const page = parseInt(hash.replace("#page=", ""), 10);
    if (!isNaN(page) && page > 0) {
      setCurrentPage(page);
    } else {
      setCurrentPage(1);
    }
  }, [location]);

  const loadItems = useCallback(async () => {
    if (!selectedCategory) return;

    setLoading(true);
    setError(null);

    try {
      const categoryName = selectedCategory.short_name;
      const subcategoryName = selectedSubcategory
        ? selectedSubcategory.short_name
        : null;

      console.log(
        `Загрузка элементов: категория=${categoryName}, подкатегория=${subcategoryName}, страница=${currentPage}`
      );

      const response = await fetchProducts(
        categoryName,
        subcategoryName,
        currentPage,
        itemsPerPage
      );

      console.log("Полученные данные:", response);

      if (response.categories) {
        console.log(`Получены подкатегории: ${response.categories.length}`);
        setItems(response.categories);
        setTotalPages(response.totalPages);
      } else if (response.products) {
        console.log(`Получены товары: ${response.products.length}`);
        setItems(response.products);
        setTotalPages(response.totalPages);
      } else {
        console.log("Нет данных о подкатегориях или товарах");
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
    if (selectedCategory) {
      setCurrentPage(1);
      const baseUrl = selectedSubcategory
        ? `/${selectedCategory.short_name}/${selectedSubcategory.short_name}`
        : `/${selectedCategory.short_name}`;
      navigate(`${baseUrl}#page=1`);
    }
  }, [selectedCategory, selectedSubcategory, navigate]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (selectedCategory) {
      const baseUrl = selectedSubcategory
        ? `/${selectedCategory.short_name}/${selectedSubcategory.short_name}`
        : `/${selectedCategory.short_name}`;
      navigate(`${baseUrl}#page=${newPage}`);
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
      {loading && (
        <div className="text-white text-center mt-8">Загрузка элементов...</div>
      )}
      {error && (
        <div className="text-red-500 text-center mt-8">
          Ошибка: {error}. Пожалуйста, попробуйте позже.
        </div>
      )}
      {!loading && !error && (
        <div
          className={`mt-4 grid gap-4 transition-all duration-500 ease-in-out ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {sortedItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onAddToBuild={onAddToBuild}
              isInBuild={buildItems.some(
                (buildItem) => buildItem.id === item.id
              )}
              onCategorySelect={onSubcategorySelect}
              categoryPath={getCategoryPath()}
            />
          ))}
        </div>
      )}
      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ProductList;
