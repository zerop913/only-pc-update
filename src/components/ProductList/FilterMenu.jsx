import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import { useProducts } from "../../hooks/useProducts";
import api from "../../redux/services/api";
import { debounce } from "lodash";

const FilterSection = memo(({ title, expanded, onToggle, children }) => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!expanded) return;

    const scrollIntoViewIfNeeded = () => {
      if (!sectionRef.current) return;

      const container = sectionRef.current.closest(".overflow-y-auto");
      if (!container) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (sectionRect.bottom > containerRect.bottom) {
        const minScrollNeeded = sectionRect.bottom - containerRect.bottom;
        container.scrollTo({
          top: container.scrollTop + minScrollNeeded + 8,
          behavior: "auto",
        });
      }
    };

    const resizeCallback = () => {
      requestAnimationFrame(scrollIntoViewIfNeeded);
    };

    const resizeObserver = new ResizeObserver(resizeCallback);

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [expanded]);

  return (
    <div className="border-b border-[#1F1E24] last:border-b-0" ref={sectionRef}>
      <button
        onClick={onToggle}
        className="w-full py-2 px-3 flex justify-between items-center text-[#E0E1E6] hover:bg-[#1D1E2C] transition-colors rounded-md"
      >
        <span className="text-sm font-medium text-left">{title}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-300 ${
            expanded ? "transform rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            ref={contentRef}
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const PriceRangeSlider = memo(
  ({ minPrice, maxPrice, priceRange, setPriceRange }) => {
    const getPercentage = useCallback(
      (value) => ((value - minPrice) / (maxPrice - minPrice)) * 100,
      [minPrice, maxPrice]
    );

    const leftPercentage = getPercentage(priceRange[0]);
    const rightPercentage = getPercentage(priceRange[1]);

    const handleInputChange = useCallback(
      (value, index) => {
        const newValue = Math.max(minPrice, Math.min(maxPrice, value));
        if (index === 0) {
          setPriceRange([Math.min(newValue, priceRange[1]), priceRange[1]]);
        } else {
          setPriceRange([priceRange[0], Math.max(newValue, priceRange[0])]);
        }
      },
      [minPrice, maxPrice, priceRange, setPriceRange]
    );

    return (
      <div className="space-y-4 pt-2">
        <div className="relative h-1">
          <div className="absolute w-full h-1 bg-[#1D1E2C] rounded-full" />
          <div
            className="absolute h-1 bg-[#2A2D3E] rounded-full"
            style={{
              left: `${leftPercentage}%`,
              right: `${100 - rightPercentage}%`,
            }}
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[0]}
            onChange={(e) => handleInputChange(Number(e.target.value), 0)}
            className="absolute w-full appearance-none bg-transparent pointer-events-none h-1
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#E0E1E6] [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2A2D3E]
            [&::-webkit-slider-thumb]:shadow-lg
            hover:[&::-webkit-slider-thumb]:bg-white"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => handleInputChange(Number(e.target.value), 1)}
            className="absolute w-full appearance-none bg-transparent pointer-events-none h-1
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#E0E1E6] [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2A2D3E]
            [&::-webkit-slider-thumb]:shadow-lg
            hover:[&::-webkit-slider-thumb]:bg-white"
          />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="relative flex-1">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => handleInputChange(Number(e.target.value), 0)}
              className="w-full bg-[#1D1E2C] border border-[#2A2D3E] rounded px-2 py-1 text-sm text-[#E0E1E6]"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#9D9EA6]">
              ₽
            </span>
          </div>
          <span className="text-[#9D9EA6]">—</span>
          <div className="relative flex-1">
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => handleInputChange(Number(e.target.value), 1)}
              className="w-full bg-[#1D1E2C] border border-[#2A2D3E] rounded px-2 py-1 text-sm text-[#E0E1E6]"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#9D9EA6]">
              ₽
            </span>
          </div>
        </div>
      </div>
    );
  }
);

const CustomCheckbox = memo(({ checked, onChange, label }) => (
  <label className="flex items-center space-x-2 text-[#9D9EA6] hover:text-[#E0E1E6] cursor-pointer group">
    <div className="relative w-4 h-4">
      <div
        className={`w-4 h-4 border rounded transition-colors ${
          checked
            ? "border-[#2A2D3E] bg-[#2A2D3E]"
            : "border-[#4A4D5E] bg-[#1D1E2C] group-hover:border-[#6A6D7E]"
        }`}
      >
        {checked && (
          <CheckIcon className="w-3 h-3 absolute top-0.5 left-0.5 text-[#E0E1E6]" />
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 w-full h-full cursor-pointer"
      />
    </div>
    <span className="text-sm truncate">{label}</span>
  </label>
));

const FilterMenu = ({
  isOpen,
  selectedCategory,
  selectedSubcategory,
  onApplyFilters,
}) => {
  const dispatch = useDispatch();
  const { fetchProducts } = useProducts();
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedValues, setSelectedValues] = useState({});
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categoryPath = useCallback(() => {
    if (!selectedCategory) return "";
    return selectedSubcategory
      ? `${selectedCategory.short_name}/${selectedSubcategory.short_name}`
      : selectedCategory.short_name;
  }, [selectedCategory, selectedSubcategory]);

  useEffect(() => {
    const abortController = new AbortController();

    // Debounce функция
    const debouncedFetchFilters = debounce(async () => {
      const path = categoryPath();
      if (!path) {
        setFilters([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/categories/filter/${path}`, {
          signal: abortController.signal,
        });
        setFilters(response.data);
        setExpandedSections({ [response.data[0]?.id]: true });
        setError(null);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error("Ошибка при загрузке фильтров:", err);
          setError("Не удалось загрузить фильтры");
          setFilters([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    debouncedFetchFilters();

    return () => {
      abortController.abort();
      debouncedFetchFilters.cancel();
    };
  }, [categoryPath]);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const handleReset = useCallback(() => {
    setSelectedValues({});
    fetchProducts({
      categoryShortName: selectedCategory?.short_name,
      childCategoryShortName: selectedSubcategory?.short_name,
    });
    onApplyFilters?.({});
  }, [fetchProducts, selectedCategory, selectedSubcategory, onApplyFilters]);

  const handleApply = useCallback(() => {
    fetchProducts({
      categoryShortName: selectedCategory?.short_name,
      childCategoryShortName: selectedSubcategory?.short_name,
      filters: selectedValues,
    });
    onApplyFilters?.(selectedValues);
  }, [
    fetchProducts,
    selectedCategory,
    selectedSubcategory,
    selectedValues,
    onApplyFilters,
  ]);

  const getActiveFiltersCount = useCallback(() => {
    return Object.values(selectedValues).reduce((count, value) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return count + (value ? 1 : 0);
    }, 0);
  }, [selectedValues]);

  if (!selectedCategory) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-[#12131E] rounded-xl border border-[#1F1E24] max-h-[calc(100vh-200px)] flex flex-col"
        >
          <div className="p-3 border-b border-[#1F1E24] flex justify-between items-center">
            <span className="text-[#E0E1E6] font-medium flex items-center">
              Фильтры
              {getActiveFiltersCount() > 0 && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-2 px-1.5 py-0.5 text-xs bg-[#2A2D3E] rounded-full"
                >
                  {getActiveFiltersCount()}
                </motion.span>
              )}
            </span>
            <button
              onClick={handleReset}
              className="text-[#9D9EA6] hover:text-[#E0E1E6] text-sm flex items-center transition-colors"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Сбросить
            </button>
          </div>

          <div className="overflow-y-auto flex-grow">
            {loading && (
              <div className="p-3 text-[#9D9EA6] text-sm">
                Загрузка фильтров...
              </div>
            )}

            {error && <div className="p-3 text-red-500 text-sm">{error}</div>}

            {!loading &&
              !error &&
              filters.map((filter) => (
                <FilterSection
                  key={filter.id}
                  title={filter.name}
                  expanded={expandedSections[filter.id]}
                  onToggle={() => toggleSection(filter.id)}
                >
                  {filter.id === "price" ? (
                    <PriceRangeSlider
                      minPrice={filter.min}
                      maxPrice={filter.max}
                      priceRange={
                        selectedValues[filter.id] || [filter.min, filter.max]
                      }
                      setPriceRange={(range) =>
                        setSelectedValues((prev) => ({
                          ...prev,
                          [filter.id]: range,
                        }))
                      }
                    />
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {filter.values?.map((value) => (
                        <CustomCheckbox
                          key={value}
                          label={value}
                          checked={(selectedValues[filter.id] || []).includes(
                            value
                          )}
                          onChange={() => {
                            setSelectedValues((prev) => {
                              const currentValues = prev[filter.id] || [];
                              const newValues = currentValues.includes(value)
                                ? currentValues.filter((v) => v !== value)
                                : [...currentValues, value];
                              return {
                                ...prev,
                                [filter.id]: newValues,
                              };
                            });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </FilterSection>
              ))}
          </div>

          <div className="p-3 border-t border-[#1F1E24]">
            <button
              onClick={handleApply}
              className="w-full py-2 text-sm bg-[#2A2D3E] text-[#E0E1E6] rounded-md hover:bg-[#353849] transition-colors"
            >
              Применить фильтры
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(FilterMenu);
