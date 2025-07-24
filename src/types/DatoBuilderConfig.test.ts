import { describe, expect, it } from "@jest/globals";
import type {
  DatoBuilderConfig,
  ResolvedDatoBuilderConfig,
} from "./DatoBuilderConfig.js";

describe("DatoBuilderConfig types", () => {
  describe("DatoBuilderConfig interface", () => {
    it("should allow valid configuration with all fields", () => {
      const config: DatoBuilderConfig = {
        apiToken: "test-token",
        overwriteExistingFields: true,
        modelApiKeySuffix: "model",
        blockApiKeySuffix: "block",
        modelsPath: "./models",
        blocksPath: "./blocks",
        logLevel: 2,
        environment: "staging",
      };

      expect(config.apiToken).toBe("test-token");
      expect(config.environment).toBe("staging");
    });

    it("should allow minimal configuration with only apiToken", () => {
      const config: DatoBuilderConfig = {
        apiToken: "test-token",
      };

      expect(config.apiToken).toBe("test-token");
      expect(config.environment).toBeUndefined();
    });

    it("should allow undefined environment", () => {
      const config: DatoBuilderConfig = {
        apiToken: "test-token",
        environment: undefined,
      };

      expect(config.apiToken).toBe("test-token");
      expect(config.environment).toBeUndefined();
    });

    it("should allow empty string environment", () => {
      const config: DatoBuilderConfig = {
        apiToken: "test-token",
        environment: "",
      };

      expect(config.apiToken).toBe("test-token");
      expect(config.environment).toBe("");
    });

    it("should allow various DatoCMS environment names", () => {
      const environments = ["main", "sandbox", "staging", "production", "dev"];

      environments.forEach((env) => {
        const config: DatoBuilderConfig = {
          apiToken: "test-token",
          environment: env,
        };

        expect(config.environment).toBe(env);
      });
    });
  });

  describe("ResolvedDatoBuilderConfig type", () => {
    it("should require all fields except environment", () => {
      const resolvedConfig: ResolvedDatoBuilderConfig = {
        apiToken: "test-token",
        overwriteExistingFields: false,
        modelApiKeySuffix: "model",
        blockApiKeySuffix: "block",
        modelsPath: "./models",
        blocksPath: "./blocks",
        logLevel: 2,
        // environment is optional
      };

      expect(resolvedConfig.apiToken).toBe("test-token");
      expect(resolvedConfig.environment).toBeUndefined();
    });

    it("should allow environment when provided", () => {
      const resolvedConfig: ResolvedDatoBuilderConfig = {
        apiToken: "test-token",
        overwriteExistingFields: false,
        modelApiKeySuffix: "model",
        blockApiKeySuffix: "block",
        modelsPath: "./models",
        blocksPath: "./blocks",
        logLevel: 2,
        environment: "sandbox",
      };

      expect(resolvedConfig.environment).toBe("sandbox");
    });

    it("should allow null suffixes", () => {
      const resolvedConfig: ResolvedDatoBuilderConfig = {
        apiToken: "test-token",
        overwriteExistingFields: false,
        modelApiKeySuffix: null,
        blockApiKeySuffix: null,
        modelsPath: "./models",
        blocksPath: "./blocks",
        logLevel: 2,
      };

      expect(resolvedConfig.modelApiKeySuffix).toBeNull();
      expect(resolvedConfig.blockApiKeySuffix).toBeNull();
    });

    it("should maintain type safety with environment undefined", () => {
      const resolvedConfig: ResolvedDatoBuilderConfig = {
        apiToken: "test-token",
        overwriteExistingFields: true,
        modelApiKeySuffix: "custom",
        blockApiKeySuffix: "block",
        modelsPath: "/path/to/models",
        blocksPath: "/path/to/blocks",
        logLevel: 1,
        environment: undefined,
      };

      // Type system should allow undefined
      const envValue: string | undefined = resolvedConfig.environment;
      expect(envValue).toBeUndefined();
    });
  });

  describe("type compatibility", () => {
    it("should allow DatoBuilderConfig to be assigned to partial ResolvedDatoBuilderConfig", () => {
      const baseConfig: DatoBuilderConfig = {
        apiToken: "test-token",
        environment: "staging",
      };

      // This should compile without type errors
      const partialResolved: Partial<ResolvedDatoBuilderConfig> = baseConfig;

      expect(partialResolved.apiToken).toBe("test-token");
      expect(partialResolved.environment).toBe("staging");
    });

    it("should handle environment type constraints", () => {
      const config: DatoBuilderConfig = {
        apiToken: "test-token",
      };

      // Environment should be string | undefined
      const envValue: string | undefined = config.environment;

      if (envValue) {
        expect(typeof envValue).toBe("string");
      } else {
        expect(envValue).toBeUndefined();
      }
    });
  });

  describe("environment field behavior", () => {
    it("should match DatoCMS client environment parameter type", () => {
      // This test ensures our environment field matches what DatoCMS client expects
      const config: DatoBuilderConfig = {
        apiToken: "test-token",
        environment: "main", // Standard DatoCMS environment
      };

      // DatoCMS client buildClient expects { environment?: string }
      const clientConfig: { apiToken: string; environment?: string } = {
        apiToken: config.apiToken,
        environment: config.environment,
      };

      expect(clientConfig.environment).toBe("main");
    });

    it("should handle undefined environment for DatoCMS client default", () => {
      const config: DatoBuilderConfig = {
        apiToken: "test-token",
        // environment omitted - should use DatoCMS client default
      };

      // DatoCMS client should handle undefined environment
      const clientConfig: { apiToken: string; environment?: string } = {
        apiToken: config.apiToken,
        environment: config.environment,
      };

      expect(clientConfig.environment).toBeUndefined();
    });

    it("should preserve environment string values", () => {
      const environments = ["main", "sandbox", "staging", "production"];

      environments.forEach((env) => {
        const config: DatoBuilderConfig = {
          apiToken: "test-token",
          environment: env,
        };

        const clientConfig: { apiToken: string; environment?: string } = {
          apiToken: config.apiToken,
          environment: config.environment,
        };

        expect(clientConfig.environment).toBe(env);
      });
    });
  });
});
