import type { Config } from "jest";
import { createDefaultEsmPreset } from "ts-jest";

const preset = createDefaultEsmPreset({});

export default {
  ...preset,
  displayName: "unit",
  testMatch: [
    "**/src/**/__tests__/**/*.(ts|tsx|js)",
    "**/src/**/*.(test|spec).(ts|tsx|js)",
    "**/tests/unit/**/*.(test|spec).(ts|tsx|js)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/tests/integration/", "/build/"],
  clearMocks: true,
  restoreMocks: true,
  maxWorkers: "50%",

  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

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
