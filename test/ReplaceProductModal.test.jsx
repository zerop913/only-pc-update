import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReplaceProductModal from "../src/components/Modal/ReplaceProductModal";
import { useCategories } from "../src/hooks/useCategories";

// Мокаем хук useCategories для контроля данных о категориях
jest.mock("../src/hooks/useCategories", () => ({
  useCategories: jest.fn(),
}));

// Мокаем framer-motion для тестирования без анимаций
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe("ReplaceProductModal Component", () => {
  // Мок-данные для категорий
  const mockCategories = [
    {
      short_name: "gpu",
      russian_name: "Видеокарты",
      children: [{ short_name: "nvidia", russian_name: "Nvidia" }],
    },
  ];

  // Мок-данные существующего продукта
  const mockExistingProduct = {
    name: "GeForce GTX 1660",
    price: 25000,
    category: "nvidia",
    image_url: "gpu.png",
  };

  // Мок-данные нового продукта
  const mockNewProduct = {
    name: "GeForce RTX 3060",
    price: 35000,
    category: "nvidia",
    image_url: "new-gpu.png",
  };

  // Моки функций для обработки действий пользователя
  const mockOnReplace = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // Настраиваем возвращаемое значение моков перед каждым тестом
    useCategories.mockReturnValue({ categories: mockCategories });
    jest.clearAllMocks();
  });

  it("отображает заголовок и текст модального окна", () => {
    // Тест проверяет корректность отображения заголовка и основного текста модального окна
    render(
      <ReplaceProductModal
        existingProduct={mockExistingProduct}
        newProduct={mockNewProduct}
        onReplace={mockOnReplace}
        onCancel={mockOnCancel}
      />
    );

    // Проверяем наличие заголовка и информационного текста
    expect(screen.getByText("Заменить товар в сборке?")).toBeInTheDocument();
    expect(
      screen.getByText(/В вашей сборке уже есть товар из категории "Nvidia"/)
    ).toBeInTheDocument();
  });

  it("отображает текущий и новый товар", () => {
    // Тест проверяет корректность отображения существующего и нового товара
    render(
      <ReplaceProductModal
        existingProduct={mockExistingProduct}
        newProduct={mockNewProduct}
        onReplace={mockOnReplace}
        onCancel={mockOnCancel}
      />
    );

    // Проверяем наличие названий и цен товаров
    expect(screen.getByText("GeForce GTX 1660")).toBeInTheDocument();
    expect(screen.getByText("25 000 ₽")).toBeInTheDocument();
    expect(screen.getByText("GeForce RTX 3060")).toBeInTheDocument();
    expect(screen.getByText("35 000 ₽")).toBeInTheDocument();
  });

  it("вызывает onReplace при клике на кнопку 'Заменить'", () => {
    // Тест проверяет работу кнопки замены товара
    render(
      <ReplaceProductModal
        existingProduct={mockExistingProduct}
        newProduct={mockNewProduct}
        onReplace={mockOnReplace}
        onCancel={mockOnCancel}
      />
    );

    // Находим и кликаем на кнопку замены
    const replaceButton = screen.getByText("Заменить");
    fireEvent.click(replaceButton);

    // Проверяем, что вызвана функция замены с корректным новым товаром
    expect(mockOnReplace).toHaveBeenCalledWith(mockNewProduct);
  });

  it("вызывает onCancel при клике на кнопку 'Отмена'", () => {
    // Тест проверяет работу кнопки отмены
    render(
      <ReplaceProductModal
        existingProduct={mockExistingProduct}
        newProduct={mockNewProduct}
        onReplace={mockOnReplace}
        onCancel={mockOnCancel}
      />
    );

    // Находим и кликаем на кнопку отмены
    const cancelButton = screen.getByText("Отмена");
    fireEvent.click(cancelButton);

    // Проверяем, что вызвана функция отмены
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("обрабатывает случай с неизвестной категорией", () => {
    // Тест проверяет поведение при отсутствии информации о категории
    useCategories.mockReturnValue({ categories: [] });

    render(
      <ReplaceProductModal
        existingProduct={{ ...mockExistingProduct, category: "unknown" }}
        newProduct={mockNewProduct}
        onReplace={mockOnReplace}
        onCancel={mockOnCancel}
      />
    );

    // Проверяем, что текст корректно обрабатывает неизвестную категорию
    expect(
      screen.getByText(/В вашей сборке уже есть товар из категории "unknown"/)
    ).toBeInTheDocument();
  });

  it("корректно обрабатывает ошибку загрузки изображения продукта", () => {
    // Тест проверяет механизм подстановки placeholder-изображения
    render(
      <ReplaceProductModal
        existingProduct={mockExistingProduct}
        newProduct={mockNewProduct}
        onReplace={mockOnReplace}
        onCancel={mockOnCancel}
      />
    );

    // Находим все изображения и симулируем ошибку загрузки
    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      fireEvent.error(img);
      // Проверяем, что src изменился на placeholder
      expect(img.src).toContain("placeholder.png");
    });
  });
});
