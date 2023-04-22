/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  modulePaths: ["<rootDir>"],
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/node_modules", "templates", "<rootDir>/dist"],
  moduleNameMapper: {
    "^@App/(.*)$": "<rootDir>/src/$1",
  },
};
