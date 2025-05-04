import type { Validator } from "./types";

export type EnumValidatorConfig = {
  values: string[];
};

export default class EnumValidator implements Validator {
  key = "enum";

  constructor(private config: EnumValidatorConfig) {
    if (
      !config.values ||
      !Array.isArray(config.values) ||
      config.values.length === 0
    ) {
      throw new Error("values parameter must be a non-empty array for enum.");
    }
  }

  build() {
    return this.config;
  }
}
