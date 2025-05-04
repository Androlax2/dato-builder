import type { Validator } from "./types";

export type FormatValidatorConfig = {
  custom_pattern?: RegExp;
  predefined_pattern?: "email" | "url";
  description?: string;
};

export default class FormatValidator implements Validator {
  key = "format";

  constructor(private config: FormatValidatorConfig) {
    if (!config.custom_pattern && !config.predefined_pattern) {
      throw new Error(
        "At least one of the parameters must be specified for format.",
      );
    }

    if (config.custom_pattern && config.predefined_pattern) {
      throw new Error(
        "Only one of custom_pattern or predefined_pattern should be specified.",
      );
    }

    if (config.predefined_pattern && config.description) {
      throw new Error(
        "description parameter is not allowed when using predefined_pattern.",
      );
    }
  }

  build() {
    const { custom_pattern, predefined_pattern, description } = this.config;

    if (custom_pattern) {
      return {
        custom_pattern: custom_pattern.toString(),
        description,
      };
    }

    return {
      predefined_pattern,
    };
  }
}
