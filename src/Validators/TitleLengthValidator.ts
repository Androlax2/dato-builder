import type { Validator } from "./types";

export type TitleLengthValidatorConfig = {
  min?: number;
  max?: number;
};

export default class TitleLengthValidator implements Validator {
  key = "title_length";

  constructor(private config: TitleLengthValidatorConfig) {
    if (!config.min && !config.max) {
      throw new Error(
        "At least one of min or max parameters must be specified for title_length.",
      );
    }
  }

  build() {
    return this.config;
  }
}
