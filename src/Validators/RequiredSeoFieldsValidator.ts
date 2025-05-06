import type { Validator } from "./types";

export type RequiredSeoFieldsValidatorConfig = {
  title?: boolean;
  description?: boolean;
  image?: boolean;
  twitter_card?: boolean;
};

export default class RequiredSeoFieldsValidator implements Validator {
  key = "required_seo_fields";

  constructor(private config: RequiredSeoFieldsValidatorConfig) {
    if (
      !config.title &&
      !config.description &&
      !config.image &&
      !config.twitter_card
    ) {
      throw new Error(
        "At least one parameter must be specified for required_seo_fields.",
      );
    }
  }

  build() {
    const { title, description, image, twitter_card } = this.config;

    return {
      title: title ?? false,
      description: description ?? false,
      image: image ?? false,
      twitter_card: twitter_card ?? false,
    };
  }
}
