import type { Validator } from "./types";

export type DateRangeValidatorConfig = {
  min?: Date;
  max?: Date;
};

export default class DateRangeValidator implements Validator {
  key = "date_range";

  constructor(private config: DateRangeValidatorConfig) {
    if (!config.min && !config.max) {
      throw new Error(
        "At least one of min or max parameters must be specified for date_range.",
      );
    }
  }

  build() {
    return {
      min: this.config.min ? this.config.min.toISOString() : undefined,
      max: this.config.max ? this.config.max.toISOString() : undefined,
    };
  }
}
