import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Categories from "../components/Categories/Categories";
import ProductList from "../components/ProductList/ProductList";
import BuildList from "../components/BuildList/BuildList";
import Tabs from "../components/Tabs/Tabs";
import Notification from "../components/UI/Notification";
import Modal from "../components/UI/Modal";
import ReplaceProductModal from "../components/Modal/ReplaceProductModal";
import RemoveProductModal from "../components/Modal/RemoveProductModal";
import ClearBuildModal from "../components/Modal/ClearBuildModal";
import useSessionStorage from "../hooks/useSessionStorage";
import { fetchCategories } from "../api";

function Configurator() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [buildItems, setBuildItems] = useSessionStorage("buildItems", []);
  const [viewMode, setViewMode] = useState("list");
  const [totalPrice, setTotalPrice] = useState(0);
  const [modalState, setModalState] = useState({ type: null, data: null });

  const navigate = useNavigate();
  const { categoryShortName, subcategoryShortName } = useParams();
  const location = useLocation();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);

        if (categoryShortName) {
          const category = categoriesData.find(
            (c) => c.short_name === categoryShortName
          );
          if (category) {
            setSelectedCategory(category);
            if (subcategoryShortName) {
              const subcategory = category.children?.find(
                (sc) => sc.short_name === subcategoryShortName
              );
              if (subcategory) {
                setSelectedSubcategory(subcategory);
              }
            }
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      const category = categories.find(
        (c) => c.short_name === categoryShortName
      );
      if (category) {
        setSelectedCategory(category);
        if (subcategoryShortName) {
          const subcategory = category.children?.find(
            (sc) => sc.short_name === subcategoryShortName
          );
          if (subcategory) {
            setSelectedSubcategory(subcategory);
          }
        } else {
          setSelectedSubcategory(null);
        }
      }
    }
  }, [categoryShortName, subcategoryShortName, categories, isLoading]);

  useEffect(() => {
    const newTotalPrice = buildItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0),
      0
    );
    setTotalPrice(newTotalPrice);
  }, [buildItems]);

  useEffect(() => {
    if (selectedSubcategory) {
      document.title = `${selectedSubcategory.russian_name} | Конфигуратор | OnlyPC`;
    } else if (selectedCategory) {
      document.title = `${selectedCategory.russian_name} | Конфигуратор | OnlyPC`;
    } else {
      document.title = "Конфигуратор | OnlyPC";
    }
  }, [selectedCategory, selectedSubcategory]);

  const handleAddToBuild = (product) => {
    let rootCategory;
    if (selectedSubcategory) {
      rootCategory = selectedCategory.short_name;
    } else {
      rootCategory = product.category || selectedCategory.short_name;
    }

    const existingProduct = buildItems.find((item) => {
      const itemCategory =
        item.category ||
        categories.find(
          (cat) =>
            cat.children?.some((subCat) => subCat.id === item.category_id) ||
            cat.id === item.category_id
        )?.short_name;
      return itemCategory === rootCategory;
    });

    if (existingProduct) {
      if (existingProduct.id === product.id) {
        window.showNotification(
          `Товар "${product.name}" уже добавлен в сборку`,
          "warning"
        );
      } else {
        setModalState({
          type: "replace",
          data: {
            existingProduct,
            newProduct: { ...product, category: rootCategory },
          },
        });
      }
    } else {
      setBuildItems((prevItems) => [
        ...prevItems,
        { ...product, category: rootCategory },
      ]);
      window.showNotification(
        `Товар "${product.name}" успешно добавлен в сборку`,
        "success"
      );
    }
  };

  const handleReplaceProduct = (newProduct) => {
    setBuildItems((prevItems) =>
      prevItems.map((item) =>
        item.category === newProduct.category ? newProduct : item
      )
    );
    setModalState({ type: null, data: null });
    window.showNotification(
      `Товар в сборке заменен на "${newProduct.name}"`,
      "success"
    );
  };

  const handleRemoveFromBuild = (productId) => {
    const productToRemove = buildItems.find((item) => item.id === productId);
    if (productToRemove) {
      setModalState({ type: "remove", data: productToRemove });
    }
  };

  const confirmRemoveFromBuild = (productId) => {
    const removedProduct = buildItems.find((item) => item.id === productId);
    setBuildItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
    setModalState({ type: null, data: null });
    if (removedProduct) {
      window.showNotification(
        `Товар "${removedProduct.name}" удален из сборки`,
        "info"
      );
    }
  };

  const handleClearBuild = () => {
    setModalState({ type: "clear", data: null });
  };

  const confirmClearBuild = () => {
    setBuildItems([]);
    setModalState({ type: null, data: null });
    window.showNotification("Сборка очищена", "info");
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setActiveTab("products");
    navigate(`/${category.short_name}#page=1`);
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    navigate(
      `/${selectedCategory.short_name}/${subcategory.short_name}#page=1`
    );
  };

  return (
    <div className="min-h-screen bg-[#0E0F18]">
      <Header />
      <div className="min-h-[200px]">
        <Categories
          categories={categories}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          totalPrice={totalPrice}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 px-4 sm:px-6 lg:px-8 min-h-[400px]">
        <div className="flex justify-center">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="relative overflow-hidden">
          <div
            className={`transition-all duration-300 ease-in-out absolute w-full ${
              activeTab === "products"
                ? "translate-x-0 relative"
                : "-translate-x-full absolute"
            }`}
          >
            <ProductList
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onAddToBuild={handleAddToBuild}
              viewMode={viewMode}
              setViewMode={setViewMode}
              buildItems={buildItems}
              onSubcategorySelect={handleSubcategorySelect}
              isLoading={isLoading}
            />
          </div>
          <div
            className={`transition-all duration-300 ease-in-out absolute w-full ${
              activeTab === "build"
                ? "translate-x-0 relative"
                : "translate-x-full absolute"
            }`}
          >
            <BuildList
              buildItems={buildItems}
              onRemoveFromBuild={handleRemoveFromBuild}
              onClearBuild={handleClearBuild}
            />
          </div>
        </div>
      </div>

      <Notification />
      <Modal
        isOpen={modalState.type !== null}
        onClose={() => setModalState({ type: null, data: null })}
      >
        {modalState.type === "replace" && (
          <ReplaceProductModal
            existingProduct={modalState.data.existingProduct}
            newProduct={modalState.data.newProduct}
            onReplace={handleReplaceProduct}
            onCancel={() => setModalState({ type: null, data: null })}
          />
        )}
        {modalState.type === "remove" && (
          <RemoveProductModal
            product={modalState.data}
            onRemove={confirmRemoveFromBuild}
            onCancel={() => setModalState({ type: null, data: null })}
          />
        )}
        {modalState.type === "clear" && (
          <ClearBuildModal
            onClear={confirmClearBuild}
            onCancel={() => setModalState({ type: null, data: null })}
          />
        )}
      </Modal>
    </div>
  );
}

export default Configurator;
