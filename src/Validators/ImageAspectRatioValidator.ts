import type { Validator } from "./types";

export type ImageAspectRatioValidatorConfig = {
  min_ar_numerator?: number;
  min_ar_denominator?: number;
  eq_ar_numerator?: number;
  eq_ar_denominator?: number;
  max_ar_numerator?: number;
  max_ar_denominator?: number;
};

export default class ImageAspectRatioValidator implements Validator {
  key = "image_aspect_ratio";

  constructor(private config: ImageAspectRatioValidatorConfig) {
    if (
      !config.min_ar_numerator &&
      !config.min_ar_denominator &&
      !config.eq_ar_numerator &&
      !config.eq_ar_denominator &&
      !config.max_ar_numerator &&
      !config.max_ar_denominator
    ) {
      throw new Error(
        "At least one pair of numerator/denominator must be specified for image_aspect_ratio.",
      );
    }

    if (
      (config.min_ar_numerator && !config.min_ar_denominator) ||
      (!config.min_ar_numerator && config.min_ar_denominator) ||
      (config.eq_ar_numerator && !config.eq_ar_denominator) ||
      (!config.eq_ar_numerator && config.eq_ar_denominator) ||
      (config.max_ar_numerator && !config.max_ar_denominator) ||
      (!config.max_ar_numerator && config.max_ar_denominator)
    ) {
      throw new Error(
        "Both numerator and denominator must be specified for each aspect ratio in image_aspect_ratio.",
      );
    }
  }

  build() {
    return this.config;
  }
}
