import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContextMenu from "./ContextMenu";
import ProductCard from "./ProductCard";
import EmptyCategory from "./EmptyCategory";
import NoCategorySelected from "./NoCategorySelected";
import SelectSubcategory from "./SelectSubcategory";
import PageNotFound from "./PageNotFound";
import ProductPage from "../../pages/ProductPage";
import { fetchProducts, fetchProductBySlug } from "../../api";
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductView, setIsProductView] = useState(false);
  const [pageMemory] = useState(new Map());
  const [isChangingPage, setIsChangingPage] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const loadingRef = useRef(false);
  const itemsPerPage = 50;

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

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useLayoutEffect(() => {
    const hash = location.hash;
    const page = parseInt(hash.replace("#page=", ""), 10);
    const categoryKey = getCategoryKey();

    if (!isNaN(page) && page > 0) {
      setCurrentPage(page);
    } else if (categoryKey) {
      const savedPage = pageMemory.get(categoryKey) || 1;
      setCurrentPage(savedPage);
      navigate(`${location.pathname}#page=${savedPage}`, { replace: true });
    }
  }, [location.hash, getCategoryKey, navigate, pageMemory]);

  const loadProduct = useCallback(async (categoryPath, slug) => {
    try {
      const product = await fetchProductBySlug(categoryPath, slug);
      setSelectedProduct(product);
      setIsProductView(true);
    } catch (err) {
      setError("Не удалось загрузить информацию о товаре");
    }
  }, []);

  const handleProductClick = useCallback(
    async (categoryPath, slug) => {
      const currentHash = location.hash;
      const currentPage = currentHash.replace("#page=", "") || "1";

      sessionStorage.setItem(
        `lastPath_${categoryPath}`,
        `/${categoryPath}${currentHash}`
      );

      navigate(`/products/${categoryPath}/${slug}`, { replace: true });
      await loadProduct(categoryPath, slug);
    },
    [location.hash, navigate, loadProduct]
  );

  const handleBreadcrumbClick = useCallback(
    (e, path) => {
      e.preventDefault();
      setIsProductView(false);
      setSelectedProduct(null);

      const pathParts = path.split("/").filter(Boolean);
      const savedPage = pageMemory.get(pathParts.join("/")) || 1;
      navigate(`${path}#page=${savedPage}`, { replace: true });
    },
    [navigate, pageMemory]
  );

  const loadItems = useCallback(async () => {
    if (!selectedCategory || loadingRef.current) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const categoryName = selectedCategory.short_name;
      const subcategoryName = selectedSubcategory?.short_name;

      const cacheKey = `${categoryName}${subcategoryName ? `/${subcategoryName}` : ""}_${currentPage}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setItems(parsedData.items);
        setTotalPages(parsedData.totalPages);
      } else {
        const response = await fetchProducts(
          categoryName,
          subcategoryName,
          currentPage,
          itemsPerPage,
          { signal: abortControllerRef.current.signal }
        );

        if (response.categories) {
          setItems(response.categories);
          setTotalPages(response.totalPages);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              items: response.categories,
              totalPages: response.totalPages,
            })
          );
        } else if (response.products) {
          setItems(response.products);
          setTotalPages(response.totalPages);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              items: response.products,
              totalPages: response.totalPages,
            })
          );
        } else {
          setItems([]);
          setTotalPages(1);
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(
        "Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
      loadingRef.current = false;
      setIsChangingPage(false);
    }
  }, [selectedCategory, selectedSubcategory, currentPage]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const sortedItems = useMemo(() => {
    if (!items.length) return [];

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

  if (items.length === 0) return <EmptyCategory />;

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
              const baseUrl = selectedSubcategory
                ? `/${selectedCategory.short_name}/${selectedSubcategory.short_name}`
                : `/${selectedCategory.short_name}`;
              navigate(`${baseUrl}#page=${page}`, { replace: true });
            }
            setCurrentPage(page);
          }}
        />
      )}
    </div>
  );
};

export default React.memo(ProductList);
