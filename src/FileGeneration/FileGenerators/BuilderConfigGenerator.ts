import type { ItemType } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
export class BuilderConfigGenerator {
  generateBuilderConfig(itemType: ItemType, type: "block" | "model"): string {
    const baseConfig = this.generateBaseConfig(itemType);
    const typeSpecificConfig =
      type === "model"
        ? this.generateModelConfig(itemType)
        : this.generateBlockConfig(itemType);

    return `{${baseConfig}${typeSpecificConfig}
    }`;
  }

  private generateBaseConfig(itemType: ItemType): string {
    return `
      name: '${this.escapeString(itemType.name)}',
      config,`;
  }

  private generateModelConfig(itemType: ItemType): string {
    return `
      body: {
        api_key: '${this.escapeString(itemType.api_key)}',
        singleton: ${this.normalizeBooleanValue(itemType.singleton)},
        sortable: ${this.normalizeBooleanValue(itemType.sortable)},
        draft_mode_active: ${this.normalizeBooleanValue(itemType.draft_mode_active)},
        all_locales_required: ${this.normalizeBooleanValue(itemType.all_locales_required)},
      },`;
  }

  private generateBlockConfig(itemType: ItemType): string {
    return `
      options: {
        api_key: '${this.escapeString(itemType.api_key)}',
        hint: '${this.escapeString(itemType.hint || "")}',
      },`;
  }

  private normalizeBooleanValue(value: boolean | undefined | null): boolean {
    return Boolean(value);
  }

  private escapeString(value: string): string {
    return value.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
}
