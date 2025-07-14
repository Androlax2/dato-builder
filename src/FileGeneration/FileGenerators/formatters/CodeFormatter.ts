import prettier from "prettier";

export interface FormatterConfig {
  parser: "typescript" | "babel" | "json";
  singleQuote?: boolean;
  trailingComma?: "none" | "es5" | "all";
  tabWidth?: number;
  semi?: boolean;
  printWidth?: number;
  bracketSpacing?: boolean;
  arrowParens?: "avoid" | "always";
}

export class CodeFormatter {
  private readonly defaultConfig: FormatterConfig = {
    parser: "typescript",
    singleQuote: true,
    trailingComma: "es5",
    tabWidth: 2,
    semi: true,
    printWidth: 80,
    bracketSpacing: true,
    arrowParens: "avoid",
  };

  constructor(private readonly config: Partial<FormatterConfig> = {}) {}

  /**
   * Format code using Prettier
   */
  async format(code: string): Promise<string> {
    try {
      const formatterConfig = { ...this.defaultConfig, ...this.config };
      return await prettier.format(code, formatterConfig);
    } catch (error) {
      console.warn("Failed to format code with Prettier:", error);
      // Return original code if formatting fails
      return code;
    }
  }
}
