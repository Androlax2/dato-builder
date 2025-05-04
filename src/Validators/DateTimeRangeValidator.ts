import type { Validator } from "./types";

export type DateTimeRangeValidatorConfig = {
  min?: Date | string;
  max?: Date | string;
};

function normalizeToUTCISOString(date?: Date | string): string | undefined {
  if (!date) return undefined;

  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date provided");
  }

  return d.toISOString().replace(/\.\d{3}Z$/, "Z"); // Remove milliseconds
}

export default class DateTimeRangeValidator implements Validator {
  key = "date_time_range";

  private readonly min?: string;
  private readonly max?: string;

  constructor(config: DateTimeRangeValidatorConfig) {
    if (!config.min && !config.max) {
      throw new Error(
        "At least one of min or max parameters must be specified for date_time_range.",
      );
    }

    this.min = normalizeToUTCISOString(config.min);
    this.max = normalizeToUTCISOString(config.max);
  }

  build() {
    return {
      min: this.min,
      max: this.max,
    };
  }
}
