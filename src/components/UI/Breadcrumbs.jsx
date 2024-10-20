import React from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

const Breadcrumbs = ({ mainCategory, subCategory, productName }) => {
  const breadcrumbs = [{ name: "Главная", path: "/" }];

  if (mainCategory) {
    breadcrumbs.push({
      name: mainCategory.russian_name,
      path: `/${mainCategory.short_name}`,
    });
  }

  if (subCategory) {
    breadcrumbs.push({
      name: subCategory.russian_name,
      path: `/${mainCategory.short_name}/${subCategory.short_name}`,
    });
  }

  breadcrumbs.push({ name: productName, path: null });

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center flex-wrap gap-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-[#9D9EA6] mx-2" />
            )}
            {crumb.path ? (
              <Link
                to={crumb.path}
                className="text-sm font-medium text-[#9D9EA6] hover:text-[#E0E1E6] transition-colors"
              >
                {crumb.name}
              </Link>
            ) : (
              <span className="text-sm font-medium text-[#E0E1E6]">
                {crumb.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
