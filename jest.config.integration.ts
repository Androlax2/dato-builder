import type { Config } from "jest";
import { createDefaultEsmPreset } from "ts-jest";

const preset = createDefaultEsmPreset({});

export default {
  ...preset,
  displayName: "integration",
  testMatch: [
    "**/tests/integration/**/*.(test|spec).(ts|tsx|js)",
    "**/*.integration.(test|spec).(ts|tsx|js)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  clearMocks: true,
  restoreMocks: true,
  maxWorkers: 1, // Run integration tests sequentially to avoid API rate limits
  testTimeout: 30000, // 30 seconds for API calls

  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.ts",
    "<rootDir>/tests/integration.setup.ts",
  ],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
} satisfies Config;
