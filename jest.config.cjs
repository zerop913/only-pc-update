// jest.config.cjs
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy",
  },
  testMatch: ["<rootDir>/test/**/*.{spec,test}.{js,jsx}"],
  // Добавляем настройки таймаута
  testTimeout: 10000,
  // Добавляем параллельное выполнение тестов
  maxWorkers: "50%",
  // Добавляем кэширование для ускорения повторных запусков
  cache: true,
  // Добавляем максимальное количество одновременных воркеров
  maxConcurrency: 5,
};