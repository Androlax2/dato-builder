import type { Validator } from "./types";

export type StructuredTextBlocksValidatorConfig = {
  item_types: string[];
};

export default class StructuredTextBlocksValidator implements Validator {
  key = "structured_text_blocks";

  constructor(private config: StructuredTextBlocksValidatorConfig) {
    if (
      !config.item_types ||
      !Array.isArray(config.item_types) ||
      config.item_types.some(() => false)
    ) {
      throw new Error(
        "item_types must be an array of strings for structured_text_blocks.",
      );
    }
  }

  build() {
    return this.config;
  }
}
