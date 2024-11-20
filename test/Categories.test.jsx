import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Categories from "../src/components/Categories/Categories";

// Мокаем глобальный fetch, чтобы контролировать его поведение
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
    ok: true,
  })
);

const mockCategories = [
  {
    short_name: "cooling",
    russian_name: "Охлаждение",
    image: "cooling.svg",
    children: [
      { short_name: "cpu-cooler", russian_name: "Кулеры для процессоров" },
      {
        short_name: "liquid-cooling",
        russian_name: "Системы жидкостного охлаждения",
      },
    ],
  },
  {
    short_name: "gpu",
    russian_name: "Видеокарты",
    image: "gpu.png",
    children: [],
  },
];

describe("Компонент Categories", () => {
  const mockOnCategorySelect = jest.fn();
  const mockOnSubcategorySelect = jest.fn();

  const defaultProps = {
    categories: mockCategories,
    onCategorySelect: mockOnCategorySelect,
    totalPrice: 50000,
    selectedCategory: null,
    selectedSubcategory: null,
    onSubcategorySelect: mockOnSubcategorySelect,
  };

  beforeEach(() => {
    // Очищаем моки fetch перед каждым тестом
    fetch.mockClear();
  });

  it("корректно отображает категории", () => {
    // Тест проверяет, что компонент правильно рендерит список категорий
    render(<Categories {...defaultProps} />);

    const cpuCategories = screen.queryAllByText(
      (content, element) =>
        content === "Охлаждение" &&
        element.classList.contains("text-xs") &&
        element.closest('div[data-testid="category-item"]')
    );

    const gpuCategories = screen.queryAllByText(
      (content, element) =>
        content === "Видеокарты" &&
        element.classList.contains("text-xs") &&
        element.closest('div[data-testid="category-item"]')
    );

    // Проверяем, что обе категории отображены ровно по одному разу
    expect(cpuCategories).toHaveLength(1);
    expect(gpuCategories).toHaveLength(1);
  });

  it("выбирает категорию при клике", () => {
    // Тест проверяет механизм выбора категории по клику
    render(<Categories {...defaultProps} />);

    // Находим первый элемент категории и кликаем на него
    const cpuCategory = screen.getAllByTestId("category-item")[0];
    fireEvent.click(cpuCategory);

    // Проверяем, что вызвана функция выбора категории с правильным аргументом
    expect(mockOnCategorySelect).toHaveBeenCalledWith(mockCategories[0]);
  });

  it("отображает подкатегории при выбранной категории", () => {
    // Тест проверяет отображение подкатегорий для выбранной категории
    render(
      <Categories {...defaultProps} selectedCategory={mockCategories[0]} />
    );

    expect(screen.getByText("Подкатегории")).toBeInTheDocument();
    expect(screen.getByText("Кулеры для процессоров")).toBeInTheDocument();
    expect(
      screen.getByText("Системы жидкостного охлаждения")
    ).toBeInTheDocument();
  });

  it("выбирает подкатегорию при клике", () => {
    // Тест проверяет механизм выбора подкатегории
    render(
      <Categories {...defaultProps} selectedCategory={mockCategories[0]} />
    );

    // Находим и кликаем на конкретную подкатегорию
    const coolingSubcategory = screen.getByText("Кулеры для процессоров");
    fireEvent.click(coolingSubcategory);

    // Проверяем, что вызвана функция выбора подкатегории с правильным аргументом
    expect(mockOnSubcategorySelect).toHaveBeenCalledWith(
      mockCategories[0].children[0]
    );
  });

  it("корректно отображает общую сумму", () => {
    // Тест проверяет отображение общей суммы сборки
    render(<Categories {...defaultProps} />);

    expect(screen.getByText("50 000 ₽")).toBeInTheDocument();
  });
});
