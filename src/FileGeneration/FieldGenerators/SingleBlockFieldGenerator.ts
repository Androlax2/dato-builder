import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

/**
 * Generates ItemTypeBuilder method calls for SingleBlock field types.
 * Handles single_block fields with framed or frameless display options.
 */
export class SingleBlockFieldGenerator extends FieldGenerator<"addSingleBlock"> {
  getMethodCallName() {
    return "addSingleBlock" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addSingleBlock"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody() as any;

    // Extract appearance parameters
    const appearance = this.field.appearance;
    const editor = appearance?.editor;
    const parameters = appearance?.parameters || {};

    // Set type based on editor
    if (editor === "frameless_single_block") {
      config.type = "frameless_single_block";
    } else {
      config.type = "framed_single_block";

      // Add start_collapsed for framed type only
      if (typeof parameters.start_collapsed === "boolean") {
        config.start_collapsed = parameters.start_collapsed;
      }
    }

    // Add validators (required for single_block fields)
    const validators: NonNullable<
      NonNullable<MethodNameToConfig<"addSingleBlock">["body"]>["validators"]
    > = {};

    // Process single_block_blocks validator (required)
    if (this.field.validators?.single_block_blocks) {
      const singleBlockBlocks = {
        ...this.field.validators.single_block_blocks,
      } as any;

      // Convert item_types from IDs to getModel/getBlock calls
      if (singleBlockBlocks.item_types) {
        const getCalls = this.convertItemTypeIdsToGetCalls(
          singleBlockBlocks.item_types,
        );
        singleBlockBlocks.item_types = getCalls;
      }

      validators.single_block_blocks = singleBlockBlocks;
    }

    // Process required validator
    this.processRequiredValidator(validators);

    body.validators = validators;

    // Add hint and default value
    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    return { ...config, body };
  }
}
