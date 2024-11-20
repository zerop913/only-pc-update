import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BuildList from "../src/components/BuildList/BuildList";

const mockBuildItems = [
  {
    id: 1,
    name: "GeForce RTX 3080",
    price: 75000,
    image: "gpu.png",
  },
  {
    id: 2,
    name: "AMD Ryzen 7 5800X",
    price: 35000,
    image_url: "cpu.png",
  },
];

describe("BuildList Component", () => {
  const mockOnRemoveFromBuild = jest.fn();
  const mockOnClearBuild = jest.fn();

  const defaultProps = {
    buildItems: mockBuildItems,
    onRemoveFromBuild: mockOnRemoveFromBuild,
    onClearBuild: mockOnClearBuild,
  };

  beforeEach(() => {
    // Очищаем моки перед каждым тестом, чтобы сбросить вызовы функций
    jest.clearAllMocks();
  });

  it("отображает список товаров корректно", () => {
    // Тест проверяет, что компонент правильно отображает список товаров
    // Убеждаемся, что заголовок, названия товаров и их цены присутствуют
    render(<BuildList {...defaultProps} />);

    expect(screen.getByText("Ваша сборка")).toBeInTheDocument();
    expect(screen.getByText("GeForce RTX 3080")).toBeInTheDocument();
    expect(screen.getByText("AMD Ryzen 7 5800X")).toBeInTheDocument();
    expect(screen.getByText("75 000 ₽")).toBeInTheDocument();
    expect(screen.getByText("35 000 ₽")).toBeInTheDocument();
  });

  it("отображает сообщение о пустой сборке, когда нет товаров", () => {
    // Тест проверяет поведение компонента, когда список товаров пуст
    render(<BuildList {...defaultProps} buildItems={[]} />);

    expect(
      screen.getByText("Ваша сборка пуста. Добавьте товары из каталога.")
    ).toBeInTheDocument();
  });

  it("вызывает функцию удаления при клике на кнопку удаления товара", () => {
    // Тест проверяет, что при клике на кнопку удаления вызывается правильная функция с корректным ID товара
    render(<BuildList {...defaultProps} />);

    const removeButtons = screen.getAllByRole("button");
    fireEvent.click(removeButtons[1]); // Кликаем на первую кнопку удаления товара

    expect(mockOnRemoveFromBuild).toHaveBeenCalledWith(mockBuildItems[0].id);
  });

  it("вызывает функцию очистки сборки при клике на кнопку очистки", () => {
    // Тест проверяет, что кнопка очистки вызывает соответствующую функцию
    render(<BuildList {...defaultProps} />);

    const clearButton = screen.getAllByRole("button")[0]; // Кнопка очистки всей сборки
    fireEvent.click(clearButton);

    expect(mockOnClearBuild).toHaveBeenCalled();
  });

  it("не отображает кнопку очистки, когда список пуст", () => {
    // Тест проверяет, что при пустом списке кнопки отсутствуют
    render(<BuildList {...defaultProps} buildItems={[]} />);

    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBe(0);
  });

  it("корректно обрабатывает ошибку загрузки изображения", () => {
    // Тест проверяет механизм подстановки placeholder-изображения при ошибке загрузки основного изображения
    const { container } = render(<BuildList {...defaultProps} />);

    const images = container.getElementsByTagName("img");
    fireEvent.error(images[0]);

    expect(images[0].src).toContain("placeholder.png");
  });
});
