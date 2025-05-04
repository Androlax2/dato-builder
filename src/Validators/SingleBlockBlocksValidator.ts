import type { Validator } from "./types";

export type SingleBlockBlocksValidatorConfig = {
  item_types: string[];
};

export default class SingleBlockBlocksValidator implements Validator {
  key = "single_block_blocks";

  constructor(private config: SingleBlockBlocksValidatorConfig) {
    if (
      !config.item_types ||
      !Array.isArray(config.item_types) ||
      config.item_types.length === 0
    ) {
      throw new Error(
        "item_types parameter must be a non-empty array for single_block_blocks.",
      );
    }
  }

  build() {
    return this.config;
  }
}
