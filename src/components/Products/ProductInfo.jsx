import React from "react";
import { HeartIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "../UI/Button";

const ProductInfo = ({ product }) => {
  return (
    <div className="bg-[#1D1E2C] rounded-xl p-6">
      <div className="flex items-start gap-8">
        <div className="w-[400px] h-[400px] flex-shrink-0 bg-[#12131E] rounded-lg">
          <img
            src={
              product.image_url
                ? `/${product.image_url}`
                : "/images/placeholder.png"
            }
            alt={product.name}
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              e.target.src = "/images/placeholder.png";
            }}
          />
        </div>

        <div className="flex-grow space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#E0E1E6] mb-4">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-[#9D9EA6] text-lg">{product.description}</p>
            )}
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-[#E0E1E6]">
              {product.price.toLocaleString()} ₽
            </span>
            {product.old_price && (
              <span className="text-xl text-[#6C6D76] line-through">
                {product.old_price.toLocaleString()} ₽
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              icon={PlusIcon}
              onClick={() => {}}
              tooltip="Добавить в сборку"
              variant="primary"
              className="flex-grow py-3.5 text-lg font-medium"
            >
              Добавить в сборку
            </Button>
            <Button
              icon={HeartIcon}
              onClick={() => {}}
              tooltip="В избранное"
              variant="secondary"
              className="py-3.5 px-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
