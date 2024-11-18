import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useCategories } from "../../hooks/useCategories";

const Breadcrumbs = ({
  mainCategory,
  subCategory,
  productName,
  onBreadcrumbClick,
}) => {
  const scrollRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { findCategoryByPath } = useCategories();

  const handleBreadcrumbClick = async (e, path) => {
    e.preventDefault();

    if (path === "/") {
      navigate(path);
      return;
    }

    // Получаем путь категории без начального слеша
    const categoryPath = path.slice(1);
    const { mainCategory, subCategory } = findCategoryByPath(categoryPath);

    if (!mainCategory) {
      console.error("Категория не найдена");
      return;
    }

    if (onBreadcrumbClick) {
      await onBreadcrumbClick(e, path);
    }

    navigate(path);
  };

  const breadcrumbs = [{ name: "Главная", path: "/" }];

  if (mainCategory) {
    breadcrumbs.push({
      name: mainCategory.russian_name,
      path: `/${mainCategory.short_name}`,
      category: mainCategory.short_name,
    });
  }

  if (subCategory) {
    breadcrumbs.push({
      name: subCategory.russian_name,
      path: `/${mainCategory.short_name}/${subCategory.short_name}`,
      category: `${mainCategory.short_name}/${subCategory.short_name}`,
    });
  }

  if (productName) {
    breadcrumbs.push({ name: productName, path: null });
  }

  useEffect(() => {
    const checkScroll = () => {
      const element = scrollRef.current;
      if (element) {
        const hasScrollableContent = element.scrollWidth > element.clientWidth;
        setShowScrollIndicator(hasScrollableContent);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (e) => {
    const element = e.target;
    const isScrolledRight = element.scrollLeft > 0;
    setIsScrolled(isScrolledRight);
  };

  return (
    <nav className="mb-6 relative" aria-label="Breadcrumb">
      <div
        className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#14161F] pointer-events-none transition-opacity duration-300 ${
          showScrollIndicator && !isScrolled ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#14161F] pointer-events-none transition-opacity duration-300 ${
          isScrolled ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto no-scrollbar relative"
      >
        <ol className="inline-flex items-center whitespace-nowrap py-2">
          {breadcrumbs.map((crumb, index) => (
            <li
              key={index}
              className={`inline-flex items-center ${
                index === breadcrumbs.length - 1 ? "pe-4" : ""
              }`}
            >
              {index > 0 && (
                <div className="mx-2 md:mx-3 text-[#9D9EA6]">
                  <ChevronRightIcon className="w-3 h-3 md:w-4 md:h-4" />
                </div>
              )}
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  onClick={(e) => handleBreadcrumbClick(e, crumb.path)}
                  className={`text-xs md:text-sm font-medium text-[#9D9EA6] hover:text-[#E0E1E6] transition-colors 
                  ${index === 0 ? "ps-4" : ""}`}
                >
                  {crumb.name}
                </Link>
              ) : (
                <span
                  className={`text-xs md:text-sm font-medium text-[#E0E1E6] line-clamp-1 max-w-[150px] md:max-w-[300px]
                  ${index === 0 ? "ps-4" : ""}`}
                >
                  {crumb.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
