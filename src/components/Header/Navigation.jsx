import React from "react";
import Button from "../Button/Button";
import { CogIcon, FolderIcon } from "@heroicons/react/24/outline";

const Navigation = ({ isTablet }) => {
  return (
    <nav className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 lg:space-x-4">
      <Button icon={CogIcon} isTablet={isTablet}>
        Конфигуратор
      </Button>
      <Button icon={FolderIcon} isTablet={isTablet}>
        Каталог
      </Button>
    </nav>
  );
};

export default Navigation;
