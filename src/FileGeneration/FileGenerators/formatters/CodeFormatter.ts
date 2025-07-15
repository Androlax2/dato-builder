import { ESLint } from "eslint";
import { format, type Options as PrettierOptions } from "prettier";
export class CodeFormatter {
  private readonly prettierConfig: PrettierOptions = {
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
  };

  private readonly eslint = new ESLint({
    baseConfig: {
      languageOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      rules: {
        // break chains longer than depth 1:
        "newline-per-chained-call": ["error", { ignoreChainWithDepth: 1 }],
      },
    },
    fix: true,
  });

  constructor(private readonly config: Partial<PrettierOptions> = {}) {}

  async format(code: string): Promise<string> {
    let formatted = code;
    try {
      formatted = await format(code, {
        ...this.prettierConfig,
        ...this.config,
      });
    } catch (_e) {
      // fallback to original
    }

    try {
      const [result] = await this.eslint.lintText(formatted);
      return result.output ?? formatted;
    } catch (_e) {
      return formatted;
    }
  }
}
