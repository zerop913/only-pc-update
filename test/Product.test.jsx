import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductCharacteristics from "../src/components/Products/ProductCharacteristics";
import ProductInfo from "../src/components/Products/ProductInfo";

// Мокаем framer-motion, чтобы избежать проблем с анимацией в тестах
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    img: ({ children, ...props }) => <img {...props}>{children}</img>,
  },
}));

describe("ProductCharacteristics Component", () => {
  const mockCharacteristics = [
    { name: "Частота", value: "3.8 ГГц" },
    { name: "Ядра", value: "8" },
    { name: "Потребление", value: "105W" },
  ];

  it("отображает заголовок и все характеристики", () => {
    // Тест проверяет, что компонент корректно отображает заголовок и все характеристики
    render(<ProductCharacteristics characteristics={mockCharacteristics} />);

    expect(screen.getByText("Характеристики")).toBeInTheDocument();

    // Проверяем, что каждая характеристика (название и значение) присутствует
    mockCharacteristics.forEach((char) => {
      expect(screen.getByText(char.name)).toBeInTheDocument();
      expect(screen.getByText(char.value)).toBeInTheDocument();
    });
  });

  it("применяет правильные стили к элементам", () => {
    // Тест проверяет, что контейнер характеристик имеет правильные CSS-классы
    const { container } = render(
      <ProductCharacteristics characteristics={mockCharacteristics} />
    );

    const characteristicsContainer = container.firstChild;
    // Проверяем наличие классов для стилизации
    expect(characteristicsContainer).toHaveClass("bg-[#1D1E2C]", "rounded-xl");
  });
});

describe("ProductInfo Component", () => {
  const mockProduct = {
    name: "AMD Ryzen 7 5800X",
    price: 75000,
    image_url: "cpu.png",
    characteristics: [
      { name: "Частота", value: "3.8 ГГц" },
      { name: "Ядра", value: "8" },
      { name: "Потребление", value: "105W" },
      { name: "Сокет", value: "AM4" },
      { name: "Кэш", value: "32MB" },
    ],
  };

  const mockOnShowAllCharacteristics = jest.fn();

  const defaultProps = {
    product: mockProduct,
    isTransitioning: false,
    onShowAllCharacteristics: mockOnShowAllCharacteristics,
  };

  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  it("отображает основную информацию о продукте", () => {
    // Тест проверяет отображение базовой информации о продукте
    render(<ProductInfo {...defaultProps} />);

    // Проверяем наличие названия, цены и изображения продукта
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText("75 000 ₽")).toBeInTheDocument();
    expect(screen.getByAltText(mockProduct.name)).toBeInTheDocument();
  });

  it("отображает только первые 4 характеристики", () => {
    // Тест проверяет, что отображаются только первые 4 характеристики
    render(<ProductInfo {...defaultProps} />);

    // Проверяем первые 4 характеристики
    const firstFourCharacteristics = mockProduct.characteristics.slice(0, 4);
    firstFourCharacteristics.forEach((char) => {
      expect(screen.getByText(char.name)).toBeInTheDocument();
      expect(screen.getByText(char.value)).toBeInTheDocument();
    });

    // Проверяем, что пятая характеристика не отображается
    expect(
      screen.queryByText(mockProduct.characteristics[4].name)
    ).not.toBeInTheDocument();
  });

  it("вызывает функцию onShowAllCharacteristics при клике на кнопку", () => {
    // Тест проверяет, что кнопка "Все характеристики" работает корректно
    render(<ProductInfo {...defaultProps} />);

    // Находим и кликаем на кнопку
    const showAllButton = screen.getByText("Все характеристики");
    fireEvent.click(showAllButton);

    // Проверяем, что вызвана соответствующая функция
    expect(mockOnShowAllCharacteristics).toHaveBeenCalled();
  });

  it("обрабатывает ошибку загрузки изображения", () => {
    // Тест проверяет механизм подстановки placeholder-изображения
    render(<ProductInfo {...defaultProps} />);

    // Вызываем событие ошибки загрузки изображения
    const img = screen.getByAltText(mockProduct.name);
    fireEvent.error(img);

    // Проверяем, что src изменился на placeholder
    expect(img.src).toContain("placeholder.png");
  });

  it("отображает кнопки добавления в сборку и в избранное", () => {
    // Тест проверяет наличие кнопок действий с продуктом
    render(<ProductInfo {...defaultProps} />);

    // Проверяем, что обе кнопки присутствуют
    expect(screen.getByText("Добавить в сборку")).toBeInTheDocument();
    expect(screen.getByText("В избранное")).toBeInTheDocument();
  });
});
