import type { Validator } from "./types";

export type RequiredAltTitleValidatorConfig = {
  /**
   * Whether the title for the asset must be specified
   *
   * @default false
   */
  title?: boolean;
  /**
   * Whether the alternate text for the asset must be specified
   *
   * @default false
   */
  alt?: boolean;
};

export default class RequiredAltTitleValidator implements Validator {
  key = "required_alt_title";

  constructor(private config: RequiredAltTitleValidatorConfig) {
    if (!config.title && !config.alt) {
      throw new Error(
        "At least one of title or alt parameters must be specified for required_alt_title.",
      );
    }
  }

  build() {
    const { title, alt } = this.config;

    return {
      required_alt_title: {
        title: title ?? false,
        alt: alt ?? false,
      },
    };
  }
}
