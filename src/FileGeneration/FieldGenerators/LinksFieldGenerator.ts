import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addLinks() method calls for multiple links fields.
 * Links fields allow selection of multiple item types (blocks or models) in DatoCMS.
 */
export class LinksFieldGenerator extends FieldGenerator<"addLinks"> {
  getMethodCallName() {
    return "addLinks" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addLinks"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addLinks">;

    // Add appearance if specified
    if (this.field.appearance?.editor) {
      config.appearance = this.mapEditorToAppearance(
        this.field.appearance.editor,
      );
    }

    const body = this.buildLinksFieldBody();
    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildLinksFieldBody(): NonNullable<
    MethodNameToConfig<"addLinks">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addLinks">["body"]
    >;

    this.addHintToBody(body);
    this.addLinksValidators(body);

    return body;
  }

  private addLinksValidators(
    body: NonNullable<MethodNameToConfig<"addLinks">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as Record<string, unknown>;

    // Add required items_item_type validator
    if (this.field.validators?.items_item_type) {
      const itemsItemType = {
        ...this.field.validators.items_item_type,
      } as Record<string, unknown>;

      // Convert item_types from IDs to getModel/getBlock calls
      if (Array.isArray(itemsItemType.item_types)) {
        const getCalls = this.convertItemTypeIdsToGetCalls(
          itemsItemType.item_types as string[],
        );
        itemsItemType.item_types = getCalls;
      }

      this.addOptionalProperty(validators, "items_item_type", itemsItemType);
    }

    // Add optional validators
    this.processRequiredValidator(validators);
    this.processUniqueValidator(validators);

    if (this.field.validators?.size) {
      this.addOptionalProperty(validators, "size", this.field.validators.size);
    }

    if (Object.keys(validators).length > 0) {
      this.addOptionalProperty(body, "validators", validators);
    }
  }

  /**
   * Map DatoCMS editor to ItemTypeBuilder appearance
   */
  private mapEditorToAppearance(editor: string): "compact" | "expanded" {
    switch (editor) {
      case "links_select":
        return "compact";
      case "links_embed":
        return "expanded";
      default:
        return "compact";
    }
  }
}
