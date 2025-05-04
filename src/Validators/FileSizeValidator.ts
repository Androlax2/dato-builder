import type { Validator } from "./types";

type SizeUnit = "B" | "KB" | "MB";

export type FileSizeValidatorConfig = {
  min_value?: number;
  min_unit?: SizeUnit;
  max_value?: number;
  max_unit?: SizeUnit;
};

export default class FileSizeValidator implements Validator {
  key = "file_size";

  constructor(private config: FileSizeValidatorConfig) {
    if (
      (!config.min_value && !config.max_value) ||
      (config.min_value && !config.min_unit) ||
      (config.max_value && !config.max_unit)
    ) {
      throw new Error(
        "At least one couple of value/unit must be specified for file_size.",
      );
    }
  }

  build() {
    return this.config;
  }
}
