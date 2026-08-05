/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/jest.setup-env.js"],
  globalSetup: "<rootDir>/jest.global-setup.js",
  // Todas las pruebas de integracion comparten una sola base de datos de test;
  // correrlas en paralelo arriesgaria condiciones de carrera en tablas compartidas.
  maxWorkers: 1,
  clearMocks: true,
};
