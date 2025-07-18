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

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addLinks">["body"]>["validators"]
    >;

    // Add required items_item_type validator
    if (this.field.validators?.items_item_type) {
      const itemsItemType = {
        // biome-ignore lint/suspicious/noExplicitAny: DatoCMS validator types require any for complex nested structures
        ...(this.field.validators.items_item_type as any),
      };

      // Convert item_types from IDs to getModel/getBlock calls
      if (itemsItemType.item_types) {
        const getCalls = this.convertItemTypeIdsToGetCalls(
          itemsItemType.item_types,
        );
        itemsItemType.item_types = getCalls;
      }

      // biome-ignore lint/suspicious/noExplicitAny: Type casting required for dynamic validator assignment
      (validators as any).items_item_type = itemsItemType;
    }

    // Add optional validators
    // biome-ignore lint/suspicious/noExplicitAny: Type casting required for validator processing
    this.processRequiredValidator(validators as any);
    this.processUniqueValidator(validators as any);

    if (this.field.validators?.size) {
      // biome-ignore lint/suspicious/noExplicitAny: Type casting required for dynamic validator assignment
      (validators as any).size = this.field.validators.size;
    }

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
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
