import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

/**
 * Generates ItemTypeBuilder method calls for RichText field types.
 * Handles rich_text fields which are used for ModularContent.
 */
export class RichTextFieldGenerator extends FieldGenerator<"addModularContent"> {
  getMethodCallName() {
    return "addModularContent" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addModularContent"> {
    const config =
      this.createBaseConfig() as MethodNameToConfig<"addModularContent">;
    const body = this.createBaseBody() as any;

    // Extract appearance parameters
    const appearance = this.field.appearance;
    const parameters = appearance?.parameters || {};

    // Add start_collapsed configuration
    if (typeof parameters.start_collapsed === "boolean") {
      config.start_collapsed = parameters.start_collapsed;
    }

    // Add validators (required for rich_text fields)
    const validators = {} as any;

    // Process rich_text_blocks validator (required)
    if (this.field.validators?.rich_text_blocks) {
      const richTextBlocks = {
        ...this.field.validators.rich_text_blocks,
      } as any;

      // Convert item_types from IDs to getModel/getBlock calls
      if (richTextBlocks.item_types) {
        const getCalls = this.convertItemTypeIdsToGetCalls(
          richTextBlocks.item_types,
        );
        richTextBlocks.item_types = getCalls;
      }

      validators.rich_text_blocks = richTextBlocks;
    }

    // Process size validator
    if (this.field.validators?.size) {
      validators.size = this.field.validators.size;
    }

    body.validators = validators;

    // Add hint and default value
    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    return { ...config, body };
  }
}
