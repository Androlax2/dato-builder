import type { Validator } from "./types";

export type ExtensionValidatorConfig = {
  extensions?: string[];
  predefined_list?: "image" | "transformable_image" | "video" | "document";
};

export default class ExtensionValidator implements Validator {
  key = "extension";

  constructor(private config: ExtensionValidatorConfig) {
    if (!config.extensions && !config.predefined_list) {
      throw new Error(
        "At least one of extensions or predefined_list parameters must be specified for extension.",
      );
    }

    if (config.extensions && config.predefined_list) {
      throw new Error(
        "Only one of extensions or predefined_list parameters must be specified for extension.",
      );
    }
  }

  build() {
    return this.config;
  }
}
