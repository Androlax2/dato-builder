import type { Validator } from "./types";

export type ItemsItemTypeValidatorConfig = {
  item_types: string[];
  on_publish_with_unpublished_references_strategy?:
    | "fail"
    | "publish_references";
  on_reference_unpublish_strategy?: "fail" | "unpublish" | "delete_references";
  on_reference_delete_strategy?: "fail" | "delete_references";
};

export default class ItemsItemTypeValidator implements Validator {
  key = "items_item_type";

  constructor(private config: ItemsItemTypeValidatorConfig) {
    if (
      !config.item_types ||
      !Array.isArray(config.item_types) ||
      config.item_types.length === 0
    ) {
      throw new Error(
        "item_types parameter must be a non-empty array for items_item_type.",
      );
    }
  }

  build() {
    return {
      ...this.config,
      on_publish_with_unpublished_references_strategy:
        this.config.on_publish_with_unpublished_references_strategy || "fail",
      on_reference_unpublish_strategy:
        this.config.on_reference_unpublish_strategy || "fail",
      on_reference_delete_strategy:
        this.config.on_reference_delete_strategy || "delete_references",
    };
  }
}
