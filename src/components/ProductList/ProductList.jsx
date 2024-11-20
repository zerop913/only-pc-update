import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useFavorites } from "../../hooks/useFavorites";
import ContextMenu from "./ContextMenu";
import ProductCard from "./ProductCard";
import EmptyCategory from "./EmptyCategory";
import NoCategorySelected from "./NoCategorySelected";
import SelectSubcategory from "./SelectSubcategory";
import PageNotFound from "./PageNotFound";
import ProductPage from "../../pages/ProductPage";
import { motion, AnimatePresence } from "framer-motion";

const MemoizedProductCard = React.memo(ProductCard);

const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;

  const handlePageChange = async (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;

    await new Promise((resolve) => {
      const scrollOptions = {
        top: 0,
        behavior: "smooth",
      };
      window.scrollTo(scrollOptions);

      const checkScrollEnd = setInterval(() => {
        if (window.scrollY === 0) {
          clearInterval(checkScrollEnd);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkScrollEnd);
        resolve();
      }, 500);
    });

    onPageChange(page);
  };

  // Функция для создания массива страниц
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(currentPage + 1, totalPages - 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const baseButtonStyle = `
    flex items-center justify-center 
    min-w-[2.5rem] h-10 px-3 
    rounded transition-colors duration-200
    font-medium text-sm
  `;

  const activeStyle = `
    ${baseButtonStyle}
    bg-[#2A2D3E] text-[#E0E1E6]
    border border-[#3A3D4E]
  `;

  const inactiveStyle = `
    ${baseButtonStyle}
    bg-[#1D1E2C] text-[#9D9EA6] 
    hover:bg-[#252736] hover:text-[#B8B9C3]
    border border-transparent
    hover:border-[#3A3D4E]
  `;

  const disabledStyle = `
    ${baseButtonStyle}
    bg-[#1D1E2C] text-[#575861]
    cursor-not-allowed
    border border-transparent
  `;

  return (
    <>
      <div className="mt-6 flex justify-center items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? disabledStyle : inactiveStyle}
          aria-label="Предыдущая страница"
        >
          ←
        </button>

        <div className="flex space-x-1">
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => page !== "..." && handlePageChange(page)}
              disabled={page === "..."}
              className={
                page === currentPage
                  ? activeStyle
                  : page === "..."
                    ? disabledStyle
                    : inactiveStyle
              }
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={currentPage === totalPages ? disabledStyle : inactiveStyle}
          aria-label="Следующая страница"
        >
          →
        </button>
      </div>
      <div className="mt-3 text-center text-sm text-[#9D9EA6]">
        Страница {currentPage} из {totalPages}
      </div>
    </>
  );
});

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
  const [isProductView, setIsProductView] = useState(false);
  const [pageMemory] = useState(new Map());
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { checkProductsFavoriteStatus } = useFavorites();

  const location = useLocation();
  const navigate = useNavigate();
  const loadingRef = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const {
    products: items,
    currentProduct: selectedProduct,
    loading,
    error,
    totalPages,
    currentPage,
    fetchProducts: loadItems,
    fetchProduct: loadProduct,
  } = useProducts();

  const getCategoryPath = useCallback(() => {
    if (!selectedCategory) return "";
    return selectedSubcategory
      ? `${selectedCategory.short_name}/${selectedSubcategory.short_name}`
      : selectedCategory.short_name;
  }, [selectedCategory, selectedSubcategory]);

  const getCategoryKey = useCallback(() => {
    if (!selectedCategory) return null;
    return selectedSubcategory
      ? `${selectedCategory.short_name}/${selectedSubcategory.short_name}`
      : selectedCategory.short_name;
  }, [selectedCategory, selectedSubcategory]);

  const retryLoadWithDelay = useCallback(async (retryFn, ...args) => {
    if (retryCount.current >= maxRetries) {
      setLoadError("Превышено количество попыток загрузки");
      retryCount.current = 0;
      return;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 * (retryCount.current + 1))
    );
    retryCount.current++;
    return retryFn(...args);
  }, []);

  const handleDataLoad = useCallback(
    async (categoryShortName, childCategoryShortName, page) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoadError(null);

      try {
        await loadItems({
          categoryShortName,
          childCategoryShortName,
          page,
        });
        retryCount.current = 0;
      } catch (err) {
        console.error("Error loading items:", err);
        if (retryCount.current < maxRetries) {
          return retryLoadWithDelay(
            handleDataLoad,
            categoryShortName,
            childCategoryShortName,
            page
          );
        }
        setLoadError("Не удалось загрузить данные");
      } finally {
        loadingRef.current = false;
      }
    },
    [loadItems, retryLoadWithDelay]
  );

  useEffect(() => {
    if (isInitialLoad && selectedCategory) {
      handleDataLoad(
        selectedCategory.short_name,
        selectedSubcategory?.short_name,
        1
      );
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, selectedCategory, selectedSubcategory, handleDataLoad]);

  useEffect(() => {
    if (items?.length > 0) {
      const currentPageProductIds = items.map((item) => item.id);
      checkProductsFavoriteStatus(currentPageProductIds);
    }
  }, [items, checkProductsFavoriteStatus]);

  useLayoutEffect(() => {
    if (!selectedCategory) return;

    const hash = location.hash;
    const page = parseInt(hash.replace("#page=", ""), 10);
    const categoryKey = getCategoryKey();

    if (!isNaN(page) && page > 0) {
      handleDataLoad(
        selectedCategory.short_name,
        selectedSubcategory?.short_name,
        page
      );
    } else if (categoryKey) {
      const savedPage = pageMemory.get(categoryKey) || 1;
      navigate(`${location.pathname}#page=${savedPage}`, { replace: true });
      handleDataLoad(
        selectedCategory.short_name,
        selectedSubcategory?.short_name,
        savedPage
      );
    }
  }, [
    location.hash,
    getCategoryKey,
    navigate,
    pageMemory,
    selectedCategory,
    selectedSubcategory,
    handleDataLoad,
  ]);

  const handleProductClick = useCallback(
    async (categoryPath, slug) => {
      const currentHash = location.hash;
      const currentPage = currentHash.replace("#page=", "") || "1";

      sessionStorage.setItem(
        `lastPath_${categoryPath}`,
        `/${categoryPath}${currentHash}`
      );

      navigate(`/products/${categoryPath}/${slug}`, { replace: true });
      await loadProduct({ categoryPath, slug });
      setIsProductView(true);
    },
    [location.hash, navigate, loadProduct]
  );

  const handleBreadcrumbClick = useCallback(
    (e, path) => {
      e.preventDefault();
      setIsProductView(false);

      const pathParts = path.split("/").filter(Boolean);
      const savedPage = pageMemory.get(pathParts.join("/")) || 1;
      navigate(`${path}#page=${savedPage}`, { replace: true });
    },
    [navigate, pageMemory]
  );

  const sortedItems = useMemo(() => {
    if (!items?.length) return [];

    return [...items].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
      }
      return 0;
    });
  }, [items, sortBy]);

  if (currentPage > totalPages && totalPages !== 0) {
    return <PageNotFound />;
  }

  if (!selectedCategory) return <NoCategorySelected />;
  if (loading)
    return (
      <div className="text-white text-center mt-8">Загрузка элементов...</div>
    );
  if (loadError)
    return <div className="text-red-500 text-center mt-8">{loadError}</div>;
  if (error)
    return <div className="text-red-500 text-center mt-8">{error}</div>;
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

  if (selectedCategory.children?.length > 0 && !selectedSubcategory) {
    return (
      <SelectSubcategory
        subcategories={selectedCategory.children}
        onSubcategorySelect={onSubcategorySelect}
      />
    );
  }

  if (!items?.length) return <EmptyCategory />;

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div>
      <ContextMenu
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categoryPath={getCategoryPath()}
      />
      <AnimatePresence mode="wait" key={`${viewMode}-${currentPage}`}>
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className={`mt-4 grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {sortedItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.3,
                delay: Math.min(index * 0.05, 0.5),
              }}
            >
              <MemoizedProductCard
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
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setIsChangingPage(true);
            const categoryKey = getCategoryKey();
            if (categoryKey) {
              loadItems({
                categoryShortName: selectedCategory.short_name,
                childCategoryShortName: selectedSubcategory?.short_name,
                page,
              });
              const baseUrl = selectedSubcategory
                ? `/${selectedCategory.short_name}/${selectedSubcategory.short_name}`
                : `/${selectedCategory.short_name}`;
              navigate(`${baseUrl}#page=${page}`, { replace: true });
            }
          }}
        />
      )}
    </div>
  );
};

export default React.memo(ProductList);
