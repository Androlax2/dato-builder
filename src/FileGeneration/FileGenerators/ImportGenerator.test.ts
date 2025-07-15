import { beforeEach, describe, expect, it } from "@jest/globals";
import { ImportGenerator } from "@/FileGeneration/FileGenerators/ImportGenerator";

describe("ImportGenerator", () => {
  let generator: ImportGenerator;

  beforeEach(() => {
    generator = new ImportGenerator();
  });

  describe("generateImports", () => {
    it("should generate correct imports for BlockBuilder", () => {
      const result = generator.generateImports("BlockBuilder");

      expect(result).toBe(
        `import BlockBuilder from "../../BlockBuilder";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should generate correct imports for ModelBuilder", () => {
      const result = generator.generateImports("ModelBuilder");

      expect(result).toBe(
        `import ModelBuilder from "../../ModelBuilder";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should handle custom builder class names", () => {
      const result = generator.generateImports("CustomBuilder");

      expect(result).toBe(
        `import CustomBuilder from "../../CustomBuilder";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should maintain consistent import structure", () => {
      const blockResult = generator.generateImports("BlockBuilder");
      const modelResult = generator.generateImports("ModelBuilder");

      // Both should have the same structure, just different builder class
      expect(blockResult.split("\n")).toHaveLength(2);
      expect(modelResult.split("\n")).toHaveLength(2);

      expect(blockResult).toContain("import type { BuilderContext }");
      expect(modelResult).toContain("import type { BuilderContext }");
    });

    it("should use relative path imports", () => {
      const result = generator.generateImports("BlockBuilder");

      expect(result).toContain('from "../../BlockBuilder"');
      expect(result).toContain('from "../../types/BuilderContext"');
    });

    it("should use proper import syntax", () => {
      const result = generator.generateImports("BlockBuilder");

      // Should use default import for builder
      expect(result).toMatch(/^import BlockBuilder from/);

      // Should use type import for BuilderContext
      expect(result).toContain("import type { BuilderContext }");
    });

    it("should handle single character builder names", () => {
      const result = generator.generateImports("B");

      expect(result).toBe(
        `import B from "../../B";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should handle very long builder names", () => {
      const longBuilderName =
        "VeryLongCustomBuilderNameThatExceedsNormalLength";
      const result = generator.generateImports(longBuilderName);

      expect(result).toBe(
        `import ${longBuilderName} from "../../${longBuilderName}";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should handle builder names with numbers", () => {
      const result = generator.generateImports("Builder2023");

      expect(result).toBe(
        `import Builder2023 from "../../Builder2023";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should handle builder names with underscores", () => {
      const result = generator.generateImports("Custom_Builder");

      expect(result).toBe(
        `import Custom_Builder from "../../Custom_Builder";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should handle CamelCase builder names", () => {
      const result = generator.generateImports("MyCustomBuilder");

      expect(result).toBe(
        `import MyCustomBuilder from "../../MyCustomBuilder";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should handle lowercase builder names", () => {
      const result = generator.generateImports("builder");

      expect(result).toBe(
        `import builder from "../../builder";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should handle UPPERCASE builder names", () => {
      const result = generator.generateImports("BUILDER");

      expect(result).toBe(
        `import BUILDER from "../../BUILDER";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should produce consistent output for same input", () => {
      const result1 = generator.generateImports("BlockBuilder");
      const result2 = generator.generateImports("BlockBuilder");

      expect(result1).toBe(result2);
    });

    it("should not include extra whitespace", () => {
      const result = generator.generateImports("BlockBuilder");

      // Should not have trailing or leading whitespace
      expect(result).not.toMatch(/^\s/);
      expect(result).not.toMatch(/\s$/);

      // Should have exactly one newline between imports
      expect(result.split("\n")).toHaveLength(2);
    });

    it("should use double quotes consistently", () => {
      const result = generator.generateImports("BlockBuilder");

      expect(result).toContain('"../../BlockBuilder"');
      expect(result).toContain('"../../types/BuilderContext"');
      expect(result).not.toContain("'");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string builder name", () => {
      const result = generator.generateImports("");

      expect(result).toBe(
        `import  from "../../";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should handle builder names with special characters", () => {
      // Note: In practice, this wouldn't be valid JavaScript, but test the method behavior
      const result = generator.generateImports("Builder-With-Dashes");

      expect(result).toBe(
        `import Builder-With-Dashes from "../../Builder-With-Dashes";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should handle builder names with spaces", () => {
      // Note: In practice, this wouldn't be valid JavaScript, but test the method behavior
      const result = generator.generateImports("Builder With Spaces");

      expect(result).toBe(
        `import Builder With Spaces from "../../Builder With Spaces";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });

    it("should maintain import order", () => {
      const result = generator.generateImports("BlockBuilder");
      const lines = result.split("\n");

      // Builder import should come first
      expect(lines[0]).toMatch(/^import BlockBuilder/);

      // BuilderContext import should come second
      expect(lines[1]).toMatch(/^import type { BuilderContext }/);
    });

    it("should be deterministic across multiple calls", () => {
      const results = Array.from({ length: 100 }, () =>
        generator.generateImports("BlockBuilder"),
      );

      // All results should be identical
      expect(results.every((result) => result === results[0])).toBe(true);
    });

    it("should handle null-like inputs gracefully", () => {
      // These tests show current behavior - in practice these inputs wouldn't occur
      expect(() => generator.generateImports(null as any)).not.toThrow();
      expect(() => generator.generateImports(undefined as any)).not.toThrow();
    });

    it("should handle numeric inputs", () => {
      // Test current behavior with non-string input
      const result = generator.generateImports(123 as any);

      expect(result).toBe(
        `import 123 from "../../123";\nimport type { BuilderContext } from "../../types/BuilderContext";`,
      );
    });
  });

  describe("real-world usage scenarios", () => {
    it("should work correctly in typical block generation", () => {
      const result = generator.generateImports("BlockBuilder");

      // The generated imports should be valid TypeScript
      expect(result).toMatch(/^import \w+ from "\.\.\/\.\.\//);
      expect(result).toContain("import type { BuilderContext }");
    });

    it("should work correctly in typical model generation", () => {
      const result = generator.generateImports("ModelBuilder");

      // The generated imports should be valid TypeScript
      expect(result).toMatch(/^import \w+ from "\.\.\/\.\.\//);
      expect(result).toContain("import type { BuilderContext }");
    });

    it("should generate imports that can be combined with other code", () => {
      const imports = generator.generateImports("BlockBuilder");
      const additionalCode =
        "\n\nexport default function build() { return new BlockBuilder(); }";
      const combined = imports + additionalCode;

      // Should be properly formatted for combining
      expect(combined).toContain("import BlockBuilder");
      expect(combined).toContain("import type { BuilderContext }");
      expect(combined).toContain("export default function");
    });
  });
});
