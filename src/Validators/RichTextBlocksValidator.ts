import type { Validator } from "./types";

export type RichTextBlocksValidatorConfig = {
  item_types: (string | Promise<string>)[];
};

export default class RichTextBlocksValidator implements Validator {
  key = "rich_text_blocks";

  constructor(private config: RichTextBlocksValidatorConfig) {
    if (
      !config.item_types ||
      !Array.isArray(config.item_types) ||
      config.item_types.length === 0
    ) {
      throw new Error(
        "item_types parameter must be a non-empty array for rich_text_blocks.",
      );
    }
  }

  async build() {
    const resolvedItemTypes = await Promise.all(
      this.config.item_types.map(async (itemType) => {
        // If it's a promise, await it; otherwise return as-is
        return typeof itemType === "string" ? itemType : await itemType;
      }),
    );

    return {
      item_types: resolvedItemTypes,
    };
  }
}
