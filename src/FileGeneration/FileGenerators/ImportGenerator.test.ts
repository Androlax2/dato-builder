import { beforeEach, describe, expect, it } from "@jest/globals";
import { ImportGenerator } from "@/FileGeneration/FileGenerators/ImportGenerator";

describe("ImportGenerator", () => {
  let localGenerator: ImportGenerator;
  let packageGenerator: ImportGenerator;

  beforeEach(() => {
    localGenerator = new ImportGenerator(true);
    packageGenerator = new ImportGenerator(false);
  });

  describe("generateImports - Local Development", () => {
    it("should generate correct imports for BlockBuilder", () => {
      const result = localGenerator.generateImports("BlockBuilder");

      expect(result).toBe(
        `import BlockBuilder from "@/BlockBuilder";\nimport type { BuilderContext } from "@/types/BuilderContext";`,
      );
    });

    it("should generate correct imports for ModelBuilder", () => {
      const result = localGenerator.generateImports("ModelBuilder");

      expect(result).toBe(
        `import ModelBuilder from "@/ModelBuilder";\nimport type { BuilderContext } from "@/types/BuilderContext";`,
      );
    });

    it("should use alias path imports", () => {
      const result = localGenerator.generateImports("BlockBuilder");

      expect(result).toContain('from "@/BlockBuilder"');
      expect(result).toContain('from "@/types/BuilderContext"');
    });

    it("should use proper import syntax for local dev", () => {
      const result = localGenerator.generateImports("BlockBuilder");

      // Should use default import for builder
      expect(result).toMatch(/^import BlockBuilder from/);

      // Should use type import for BuilderContext
      expect(result).toContain("import type { BuilderContext }");
    });
  });

  describe("generateImports - Package Usage", () => {
    it("should generate correct imports for BlockBuilder", () => {
      const result = packageGenerator.generateImports("BlockBuilder");

      expect(result).toBe(
        `import { BlockBuilder } from "dato-builder";\nimport type { BuilderContext } from "dato-builder";`,
      );
    });

    it("should generate correct imports for ModelBuilder", () => {
      const result = packageGenerator.generateImports("ModelBuilder");

      expect(result).toBe(
        `import { ModelBuilder } from "dato-builder";\nimport type { BuilderContext } from "dato-builder";`,
      );
    });

    it("should use package imports", () => {
      const result = packageGenerator.generateImports("BlockBuilder");

      expect(result).toContain('from "dato-builder"');
      expect(result).toContain(
        'import type { BuilderContext } from "dato-builder"',
      );
    });

    it("should use proper import syntax for package", () => {
      const result = packageGenerator.generateImports("BlockBuilder");

      // Should use named import for builder
      expect(result).toMatch(/^import \{ BlockBuilder \} from/);

      // Should use type import for BuilderContext
      expect(result).toContain("import type { BuilderContext }");
    });
  });

  describe("shared behavior", () => {
    it("should handle custom builder class names in local dev", () => {
      const result = localGenerator.generateImports("CustomBuilder");

      expect(result).toBe(
        `import CustomBuilder from "@/CustomBuilder";\nimport type { BuilderContext } from "@/types/BuilderContext";`,
      );
    });

    it("should handle custom builder class names in package", () => {
      const result = packageGenerator.generateImports("CustomBuilder");

      expect(result).toBe(
        `import { CustomBuilder } from "dato-builder";\nimport type { BuilderContext } from "dato-builder";`,
      );
    });

    it("should maintain consistent import structure", () => {
      const blockResult = localGenerator.generateImports("BlockBuilder");
      const modelResult = localGenerator.generateImports("ModelBuilder");

      // Both should have the same structure, just different builder class
      expect(blockResult.split("\n")).toHaveLength(2);
      expect(modelResult.split("\n")).toHaveLength(2);

      expect(blockResult).toContain("import type { BuilderContext }");
      expect(modelResult).toContain("import type { BuilderContext }");
    });

    it("should handle single character builder names", () => {
      const localResult = localGenerator.generateImports("B");
      const packageResult = packageGenerator.generateImports("B");

      expect(localResult).toBe(
        `import B from "@/B";\nimport type { BuilderContext } from "@/types/BuilderContext";`,
      );
      expect(packageResult).toBe(
        `import { B } from "dato-builder";\nimport type { BuilderContext } from "dato-builder";`,
      );
    });

    it("should handle very long builder names", () => {
      const longBuilderName =
        "VeryLongCustomBuilderNameThatExceedsNormalLength";
      const localResult = localGenerator.generateImports(longBuilderName);
      const packageResult = packageGenerator.generateImports(longBuilderName);

      expect(localResult).toBe(
        `import ${longBuilderName} from "@/${longBuilderName}";\nimport type { BuilderContext } from "@/types/BuilderContext";`,
      );
      expect(packageResult).toBe(
        `import { ${longBuilderName} } from "dato-builder";\nimport type { BuilderContext } from "dato-builder";`,
      );
    });

    it("should produce consistent output for same input", () => {
      const result1 = localGenerator.generateImports("BlockBuilder");
      const result2 = localGenerator.generateImports("BlockBuilder");

      expect(result1).toBe(result2);
    });

    it("should not include extra whitespace", () => {
      const result = localGenerator.generateImports("BlockBuilder");

      // Should not have trailing or leading whitespace
      expect(result).not.toMatch(/^\s/);
      expect(result).not.toMatch(/\s$/);

      // Should have exactly one newline between imports
      expect(result.split("\n")).toHaveLength(2);
    });

    it("should use double quotes consistently", () => {
      const localResult = localGenerator.generateImports("BlockBuilder");
      const packageResult = packageGenerator.generateImports("BlockBuilder");

      expect(localResult).toContain('"@/BlockBuilder"');
      expect(localResult).toContain('"@/types/BuilderContext"');
      expect(localResult).not.toContain("'");

      expect(packageResult).toContain('"dato-builder"');
      expect(packageResult).not.toContain("'");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string builder name", () => {
      const localResult = localGenerator.generateImports("");
      const packageResult = packageGenerator.generateImports("");

      expect(localResult).toBe(
        `import  from "@/";\nimport type { BuilderContext } from "@/types/BuilderContext";`,
      );
      expect(packageResult).toBe(
        `import {  } from "dato-builder";\nimport type { BuilderContext } from "dato-builder";`,
      );
    });

    it("should throw for null-like inputs", () => {
      expect(() => localGenerator.generateImports(null as any)).toThrow(
        "Invalid input: builderClass cannot be null or undefined",
      );
      expect(() => localGenerator.generateImports(undefined as any)).toThrow(
        "Invalid input: builderClass cannot be null or undefined",
      );
      expect(() => packageGenerator.generateImports(null as any)).toThrow(
        "Invalid input: builderClass cannot be null or undefined",
      );
      expect(() => packageGenerator.generateImports(undefined as any)).toThrow(
        "Invalid input: builderClass cannot be null or undefined",
      );
    });

    it("should handle numeric inputs", () => {
      const localResult = localGenerator.generateImports(123 as any);
      const packageResult = packageGenerator.generateImports(123 as any);

      expect(localResult).toBe(
        `import 123 from "@/123";\nimport type { BuilderContext } from "@/types/BuilderContext";`,
      );
      expect(packageResult).toBe(
        `import { 123 } from "dato-builder";\nimport type { BuilderContext } from "dato-builder";`,
      );
    });
  });

  describe("real-world usage scenarios", () => {
    it("should work correctly in typical block generation for local dev", () => {
      const result = localGenerator.generateImports("BlockBuilder");

      // The generated imports should be valid TypeScript
      expect(result).toMatch(/^import \w+ from "@\//);
      expect(result).toContain("import type { BuilderContext }");
    });

    it("should work correctly in typical block generation for package", () => {
      const result = packageGenerator.generateImports("BlockBuilder");

      // The generated imports should be valid TypeScript
      expect(result).toMatch(/^import \{ \w+ \} from "dato-builder"/);
      expect(result).toContain("import type { BuilderContext }");
    });

    it("should generate imports that can be combined with other code", () => {
      const localImports = localGenerator.generateImports("BlockBuilder");
      const packageImports = packageGenerator.generateImports("BlockBuilder");
      const additionalCode =
        "\n\nexport default function build() { return new BlockBuilder(); }";

      const localCombined = localImports + additionalCode;
      const packageCombined = packageImports + additionalCode;

      // Should be properly formatted for combining
      expect(localCombined).toContain("import BlockBuilder");
      expect(localCombined).toContain("import type { BuilderContext }");
      expect(localCombined).toContain("export default function");

      expect(packageCombined).toContain("import { BlockBuilder }");
      expect(packageCombined).toContain("import type { BuilderContext }");
      expect(packageCombined).toContain("export default function");
    });
  });
});
