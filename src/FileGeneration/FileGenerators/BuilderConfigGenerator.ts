import type { ItemType } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";

export class BuilderConfigGenerator {
  generateBuilderConfig(itemType: ItemType, type: "block" | "model"): string {
    if (type === "model") {
      return `{
      name: '${itemType.name}',
      config,
      body: {
        api_key: '${itemType.api_key}',
        singleton: ${itemType.singleton || false},
        sortable: ${itemType.sortable || false},
        draft_mode_active: ${itemType.draft_mode_active || false},
        all_locales_required: ${itemType.all_locales_required || false},
      },
    }`;
    } else {
      return `{
      name: '${itemType.name}',
      config,
      options: {
        api_key: '${itemType.api_key}',
        hint: '${itemType.hint || ""}',
      },
    }`;
    }
  }
}
