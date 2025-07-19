import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addLink() method calls for single link fields.
 * Link fields reference other item types (blocks or models) in DatoCMS.
 */
export class LinkFieldGenerator extends FieldGenerator<"addLink"> {
  getMethodCallName() {
    return "addLink" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addLink"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addLink">;

    // Add appearance if specified
    if (this.field.appearance?.editor) {
      config.appearance = this.mapEditorToAppearance(
        this.field.appearance.editor,
      );
    }

    const body = this.buildLinkFieldBody();
    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildLinkFieldBody(): NonNullable<
    MethodNameToConfig<"addLink">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addLink">["body"]
    >;

    this.addHintToBody(body);
    this.addLinkValidators(body);

    return body;
  }

  private addLinkValidators(
    body: NonNullable<MethodNameToConfig<"addLink">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addLink">["body"]>["validators"]
    >;

    // Add required item_item_type validator
    if (this.field.validators?.item_item_type) {
      const itemItemType = {
        ...this.field.validators.item_item_type,
      } as Record<string, unknown>;

      // Convert item_types from IDs to getModel/getBlock calls
      if (Array.isArray(itemItemType.item_types)) {
        const getCalls = this.convertItemTypeIdsToGetCalls(
          itemItemType.item_types as string[],
        );
        itemItemType.item_types = getCalls;
      }

      this.addOptionalProperty(validators, "item_item_type", itemItemType);
    }

    // Add optional validators
    this.processRequiredValidator(validators);
    this.processUniqueValidator(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }

  /**
   * Map DatoCMS editor to ItemTypeBuilder appearance
   */
  private mapEditorToAppearance(editor: string): "compact" | "expanded" {
    switch (editor) {
      case "link_select":
        return "compact";
      case "link_embed":
        return "expanded";
      default:
        return "compact";
    }
  }
}
