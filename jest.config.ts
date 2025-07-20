import type { Config } from "jest";
import { createDefaultEsmPreset } from "ts-jest";

const preset = createDefaultEsmPreset({});

export default {
  ...preset,
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
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
