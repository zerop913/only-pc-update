import React from "react";
import { motion } from "framer-motion";
import Button from "../UI/Button";
import { useCategories } from "../../hooks/useCategories";

const ProductCard = ({ product, isNew }) => {
  const imageSrc = product.image_url
    ? `/${product.image_url}`
    : product.image
      ? `/images/${product.image}`
      : `/images/placeholder.png`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isNew ? 0.2 : 0 }}
      className="bg-[#12131E] rounded-lg p-4 flex items-center space-x-4"
    >
      <div className="w-16 h-16 flex-shrink-0">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover rounded-md"
          onError={(e) => {
            console.error(
              `Ошибка загрузки изображения для ${product.name}:`,
              e
            );
            e.target.src = "/images/placeholder.png";
          }}
        />
      </div>
      <div>
        <h3 className="text-[#E0E1E6] font-semibold">{product.name}</h3>
        <p className="text-[#9D9EA6]">{product.price.toLocaleString()} ₽</p>
      </div>
    </motion.div>
  );
};

const ReplaceProductModal = ({
  existingProduct,
  newProduct,
  onReplace,
  onCancel,
}) => {
  const { categories } = useCategories();

  const findRussianCategoryName = (categorySlug) => {
    for (const category of categories) {
      if (category.short_name === categorySlug) {
        return category.russian_name;
      }
      if (category.children) {
        const subCategory = category.children.find(
          (sub) => sub.short_name === categorySlug
        );
        if (subCategory) {
          return subCategory.russian_name;
        }
      }
    }
    return categorySlug;
  };

  const categoryRussianName = findRussianCategoryName(existingProduct.category);

  return (
    <div className="space-y-4">
      <h2 className="text-[#E0E1E6] text-xl font-semibold">
        Заменить товар в сборке?
      </h2>
      <p className="text-[#9D9EA6]">
        В вашей сборке уже есть товар из категории "{categoryRussianName}". Вы
        уверены, что хотите заменить его на новый?
      </p>
      <div className="space-y-2">
        <h3 className="text-[#E0E1E6]">Текущий товар:</h3>
        <ProductCard product={existingProduct} isNew={false} />
      </div>
      <div className="space-y-2">
        <h3 className="text-[#E0E1E6]">Новый товар:</h3>
        <ProductCard product={newProduct} isNew={true} />
      </div>
      <motion.div
        className="flex justify-end space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button onClick={onCancel} variant="secondary">
          Отмена
        </Button>
        <Button onClick={() => onReplace(newProduct)}>Заменить</Button>
      </motion.div>
    </div>
  );
};

export default ReplaceProductModal;
