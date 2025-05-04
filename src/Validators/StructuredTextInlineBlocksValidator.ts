import type { Validator } from "./types";

export type StructuredTextInlineBlocksValidatorConfig = {
  item_types: string[];
};

export default class StructuredTextInlineBlocksValidator implements Validator {
  key = "structured_text_inline_blocks";

  constructor(private config: StructuredTextInlineBlocksValidatorConfig) {
    if (
      !config.item_types ||
      !Array.isArray(config.item_types) ||
      config.item_types.some(() => false)
    ) {
      throw new Error(
        "item_types must be an array of strings for structured_text_inline_blocks.",
      );
    }
  }

  build() {
    return this.config;
  }
}
