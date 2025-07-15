import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Options as PrettierOptions } from "prettier";
import { CodeFormatter } from "@/FileGeneration/FileGenerators/formatters/CodeFormatter";

// Mock prettier and eslint
jest.mock("prettier", () => ({
  format: jest.fn(),
}));

jest.mock("eslint", () => ({
  ESLint: jest.fn(),
}));

import { ESLint } from "eslint";
import { format as mockPrettierFormat } from "prettier";

const mockFormat = mockPrettierFormat as jest.MockedFunction<
  typeof mockPrettierFormat
>;
const MockedESLint = ESLint as jest.MockedClass<typeof ESLint>;

describe("CodeFormatter", () => {
  let formatter: CodeFormatter;
  let mockESLintInstance: jest.Mocked<ESLint>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockESLintInstance = {
      lintText: jest.fn(),
    } as any;

    MockedESLint.mockImplementation(() => mockESLintInstance);

    formatter = new CodeFormatter();
  });

  describe("constructor", () => {
    it("should initialize with default prettier config", () => {
      new CodeFormatter();

      // Should create ESLint instance with correct config
      expect(MockedESLint).toHaveBeenCalledWith({
        baseConfig: {
          languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
          },
          rules: {
            "newline-per-chained-call": ["error", { ignoreChainWithDepth: 1 }],
          },
        },
        fix: true,
      });
    });

    it("should accept custom prettier config", () => {
      const customConfig: Partial<PrettierOptions> = {
        printWidth: 120,
        singleQuote: true,
        tabWidth: 4,
      };

      const customFormatter = new CodeFormatter(customConfig);

      expect(customFormatter).toBeInstanceOf(CodeFormatter);
    });

    it("should handle empty custom config", () => {
      const emptyFormatter = new CodeFormatter({});

      expect(emptyFormatter).toBeInstanceOf(CodeFormatter);
    });

    it("should handle undefined custom config", () => {
      const undefinedFormatter = new CodeFormatter(undefined);

      expect(undefinedFormatter).toBeInstanceOf(CodeFormatter);
    });
  });

  describe("format", () => {
    beforeEach(() => {
      mockFormat.mockResolvedValue("formatted code");
      mockESLintInstance.lintText.mockResolvedValue([
        {
          output: "eslint formatted code",
        },
      ] as any);
    });

    it("should format code using prettier and eslint", async () => {
      const inputCode = "const test = 'hello';";

      const result = await formatter.format(inputCode);

      expect(mockFormat).toHaveBeenCalledWith(inputCode, {
        parser: "typescript",
        singleQuote: false,
        trailingComma: "es5",
        tabWidth: 2,
        semi: true,
        printWidth: 30,
        bracketSpacing: true,
        arrowParens: "avoid",
        bracketSameLine: false,
        singleAttributePerLine: false,
      });

      expect(mockESLintInstance.lintText).toHaveBeenCalledWith(
        "formatted code",
      );
      expect(result).toBe("eslint formatted code");
    });

    it("should use custom prettier config when provided", async () => {
      const customConfig: Partial<PrettierOptions> = {
        printWidth: 120,
        singleQuote: true,
        tabWidth: 4,
      };

      const customFormatter = new CodeFormatter(customConfig);
      const inputCode = "const test = 'hello';";

      await customFormatter.format(inputCode);

      expect(mockFormat).toHaveBeenCalledWith(inputCode, {
        parser: "typescript",
        singleQuote: true, // overridden
        trailingComma: "es5",
        tabWidth: 4, // overridden
        semi: true,
        printWidth: 120, // overridden
        bracketSpacing: true,
        arrowParens: "avoid",
        bracketSameLine: false,
        singleAttributePerLine: false,
      });
    });

    it("should fallback to original code when prettier fails", async () => {
      const inputCode = "const test = 'hello';";
      mockFormat.mockRejectedValue(new Error("Prettier failed"));

      const result = await formatter.format(inputCode);

      expect(mockESLintInstance.lintText).toHaveBeenCalledWith(inputCode);
      expect(result).toBe("eslint formatted code");
    });

    it("should fallback to prettier output when eslint fails", async () => {
      const inputCode = "const test = 'hello';";
      mockESLintInstance.lintText.mockRejectedValue(new Error("ESLint failed"));

      const result = await formatter.format(inputCode);

      expect(result).toBe("formatted code");
    });

    it("should fallback to original code when both prettier and eslint fail", async () => {
      const inputCode = "const test = 'hello';";
      mockFormat.mockRejectedValue(new Error("Prettier failed"));
      mockESLintInstance.lintText.mockRejectedValue(new Error("ESLint failed"));

      const result = await formatter.format(inputCode);

      expect(result).toBe(inputCode);
    });

    it("should use eslint output when available", async () => {
      const inputCode = "const test = 'hello';";
      mockESLintInstance.lintText.mockResolvedValue([
        {
          output: "eslint output",
        },
      ] as any);

      const result = await formatter.format(inputCode);

      expect(result).toBe("eslint output");
    });

    it("should fallback to prettier output when eslint output is undefined", async () => {
      const inputCode = "const test = 'hello';";
      mockESLintInstance.lintText.mockResolvedValue([
        {
          output: undefined,
        },
      ] as any);

      const result = await formatter.format(inputCode);

      expect(result).toBe("formatted code");
    });

    it("should fallback to prettier output when eslint output is null", async () => {
      const inputCode = "const test = 'hello';";
      mockESLintInstance.lintText.mockResolvedValue([
        {
          output: null,
        },
      ] as any);

      const result = await formatter.format(inputCode);

      expect(result).toBe("formatted code");
    });

    it("should handle empty input code", async () => {
      const result = await formatter.format("");

      expect(mockFormat).toHaveBeenCalledWith("", expect.any(Object));
      expect(result).toBe("eslint formatted code");
    });

    it("should handle multiline code", async () => {
      const multilineCode = `
        function test() {
          const x = 1;
          const y = 2;
          return x + y;
        }
      `;

      await formatter.format(multilineCode);

      expect(mockFormat).toHaveBeenCalledWith(
        multilineCode,
        expect.any(Object),
      );
    });

    it("should handle code with syntax errors gracefully", async () => {
      const invalidCode = "const test = ;";
      mockFormat.mockRejectedValue(new Error("Syntax error"));
      mockESLintInstance.lintText.mockRejectedValue(new Error("Syntax error"));

      const result = await formatter.format(invalidCode);

      expect(result).toBe(invalidCode);
    });

    it("should preserve code content through formatting", async () => {
      const complexCode = `
        import BlockBuilder from "../../BlockBuilder";
        import type { BuilderContext } from "../../types/BuilderContext";
        
        export default function buildTestBlock({ config }: BuilderContext) {
          return new BlockBuilder({
            name: 'Test Block',
            config,
            options: { api_key: 'test_block' }
          }).addText({ label: 'Title' });
        }
      `;

      mockFormat.mockResolvedValue(complexCode.trim());
      mockESLintInstance.lintText.mockResolvedValue([
        {
          output: complexCode.trim(),
        },
      ] as any);

      const result = await formatter.format(complexCode);

      expect(result).toBe(complexCode.trim());
    });
  });

  describe("prettier configuration", () => {
    it("should use typescript parser by default", async () => {
      await formatter.format("const test = 'hello';");

      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ parser: "typescript" }),
      );
    });

    it("should use specified print width", async () => {
      await formatter.format("const test = 'hello';");

      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ printWidth: 30 }),
      );
    });

    it("should use double quotes by default", async () => {
      await formatter.format("const test = 'hello';");

      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ singleQuote: false }),
      );
    });

    it("should use semicolons by default", async () => {
      await formatter.format("const test = 'hello';");

      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ semi: true }),
      );
    });

    it("should allow custom config to override defaults", async () => {
      const customFormatter = new CodeFormatter({
        singleQuote: true,
        semi: false,
        printWidth: 100,
      });

      await customFormatter.format("const test = 'hello';");

      expect(mockFormat).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          singleQuote: true,
          semi: false,
          printWidth: 100,
        }),
      );
    });
  });

  describe("eslint configuration", () => {
    it("should configure eslint with chained call rules", () => {
      new CodeFormatter();

      expect(MockedESLint).toHaveBeenCalledWith(
        expect.objectContaining({
          baseConfig: expect.objectContaining({
            rules: {
              "newline-per-chained-call": [
                "error",
                { ignoreChainWithDepth: 1 },
              ],
            },
          }),
        }),
      );
    });

    it("should enable eslint auto-fix", () => {
      new CodeFormatter();

      expect(MockedESLint).toHaveBeenCalledWith(
        expect.objectContaining({
          fix: true,
        }),
      );
    });

    it("should configure for ES2020 modules", () => {
      new CodeFormatter();

      expect(MockedESLint).toHaveBeenCalledWith(
        expect.objectContaining({
          baseConfig: expect.objectContaining({
            languageOptions: {
              ecmaVersion: 2020,
              sourceType: "module",
            },
          }),
        }),
      );
    });
  });

  describe("error handling edge cases", () => {
    it("should handle prettier throwing non-Error objects", async () => {
      const inputCode = "const test = 'hello';";
      mockFormat.mockRejectedValue("String error");
      mockESLintInstance.lintText.mockRejectedValue(new Error("ESLint failed"));

      const result = await formatter.format(inputCode);

      expect(result).toBe(inputCode);
    });

    it("should handle eslint throwing non-Error objects", async () => {
      const inputCode = "const test = 'hello';";
      mockFormat.mockResolvedValue("formatted code");
      mockESLintInstance.lintText.mockRejectedValue("String error");

      const result = await formatter.format(inputCode);

      expect(result).toBe("formatted code");
    });

    it("should handle eslint returning empty results array", async () => {
      const inputCode = "const test = 'hello';";
      mockFormat.mockResolvedValue("formatted code");
      mockESLintInstance.lintText.mockResolvedValue([]);

      const result = await formatter.format(inputCode);

      expect(result).toBe("formatted code");
    });

    it("should handle eslint returning multiple results", async () => {
      const inputCode = "const test = 'hello';";
      mockESLintInstance.lintText.mockResolvedValue([
        { output: "first result" },
        { output: "second result" },
      ] as any);

      const result = await formatter.format(inputCode);

      // Should use the first result
      expect(result).toBe("first result");
    });

    it("should handle very large code inputs", async () => {
      const largeCode = "const test = 'hello';\n".repeat(10000);

      await formatter.format(largeCode);

      expect(mockFormat).toHaveBeenCalledWith(largeCode, expect.any(Object));
    });

    it("should handle code with special characters", async () => {
      const specialCode = "const test = '🚀 Hello 世界 \u0000 \u200B';";

      await formatter.format(specialCode);

      expect(mockFormat).toHaveBeenCalledWith(specialCode, expect.any(Object));
    });
  });
});
