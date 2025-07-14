import prettier, { type Options } from "prettier";

export class CodeFormatter {
  private readonly defaultConfig: Options = {
    parser: "typescript",
    singleQuote: false,
    trailingComma: "es5",
    tabWidth: 2,
    semi: true,
    printWidth: 120,
    bracketSpacing: true,
    arrowParens: "avoid",
    bracketSameLine: true,
    singleAttributePerLine: false,
  };

  constructor(private readonly config: Options = {}) {}

  /**
   * Format code using Prettier
   */
  async format(code: string): Promise<string> {
    try {
      return await prettier.format(code, {
        ...this.defaultConfig,
        ...this.config,
      });
    } catch (error) {
      console.warn("Failed to format code with Prettier:", error);
      // Return original code if formatting fails
      return code;
    }
  }
}
