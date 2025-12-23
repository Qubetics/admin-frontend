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

    "^@keplr-wallet/cosmos$": "<rootDir>/__mocks__/keplr-cosmos.js",
    "^@keplr-wallet/proto-types$": "<rootDir>/__mocks__/keplr-proto-types.js",
    "^@keplr-wallet/common$": "<rootDir>/__mocks__/keplr-common.js",
    "^@cosmjs/stargate$": "<rootDir>/__mocks__/cosmjs-stargate.js",
    "^@cosmjs/proto-signing$": "<rootDir>/__mocks__/cosmjs-proto-signing.js",
  },

  testMatch: ["**/__test__/**/*.[jt]s?(x)", "**/?(*.)+(test).[tj]s?(x)"],

  testPathIgnorePatterns: [
    "<rootDir>/src/proto-gen/",
    "<rootDir>/src/Common/Loader/TableSkeleton.tsx",
  ],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/proto-gen/",
    "<rootDir>/src/Common/Loader/TableSkeleton.tsx",
  ],
};
