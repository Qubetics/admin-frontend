module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  transformIgnorePatterns: [
    "node_modules/(?!(@keplr-wallet|@cosmjs|axios|react-toastify)/)",
  ],

  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],

  setupFiles: ["<rootDir>/jest.polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],

  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
    "\\.(gif|jpg|jpeg|png|svg)$": "<rootDir>/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",

    "^.*Constant/envConstants$": "<rootDir>/__mocks__/envConstants.ts",
  },

  // ✅ Ignore proto-gen folder from tests
  testPathIgnorePatterns: ["<rootDir>/src/proto-gen/"],

  // ✅ Ignore proto-gen folder from coverage
  coveragePathIgnorePatterns: ["<rootDir>/src/proto-gen/"],
};
