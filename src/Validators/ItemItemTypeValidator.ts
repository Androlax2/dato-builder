import type { Validator } from "./types";

export type ItemItemTypeValidatorConfig = {
  item_types: (string | Promise<string>)[];
  on_publish_with_unpublished_references_strategy?:
    | "fail"
    | "publish_references";
  on_reference_unpublish_strategy?: "fail" | "unpublish" | "delete_references";
  on_reference_delete_strategy?: "fail" | "delete_references";
};

export default class ItemItemTypeValidator implements Validator {
  key = "item_item_type";

  constructor(private config: ItemItemTypeValidatorConfig) {
    if (
      !config.item_types ||
      !Array.isArray(config.item_types) ||
      config.item_types.length === 0
    ) {
      throw new Error(
        "item_types parameter must be a non-empty array for item_item_type.",
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
