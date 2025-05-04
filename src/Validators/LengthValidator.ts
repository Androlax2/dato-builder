import type { Validator } from "./types";

export interface LengthValidatorConfig {
  min?: number;
  eq?: number;
  max?: number;
}

export default class LengthValidator implements Validator {
  key = "length";

  constructor(private config: LengthValidatorConfig) {
    if (!config.min && !config.eq && !config.max) {
      throw new Error(
        "At least one of min, eq, or max parameters must be specified for length.",
      );
    }
  }

  build() {
    return this.config;
  }
}
