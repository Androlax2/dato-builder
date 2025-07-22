import type { Config } from "jest";

export default {
  projects: [
    "<rootDir>/jest.config.unit.ts",
    "<rootDir>/jest.config.integration.ts",
  ],

  // Coverage settings apply to all projects
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/plop-templates/**",
  ],
} satisfies Config;
