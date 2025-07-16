import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

/**
 * Generates ItemTypeBuilder method calls for StructuredText field types.
 * Handles structured_text fields with rich text editing capabilities.
 */
export class StructuredTextFieldGenerator extends FieldGenerator<"addStructuredText"> {
  getMethodCallName() {
    return "addStructuredText" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addStructuredText"> {
    const config =
      this.createBaseConfig() as MethodNameToConfig<"addStructuredText">;
    const body = this.createBaseBody() as any;

    // Extract appearance parameters
    const appearance = this.field.appearance;
    const parameters = appearance?.parameters || {};

    // Add appearance-based configuration
    if (parameters.nodes && Array.isArray(parameters.nodes)) {
      config.nodes = parameters.nodes as any;
    }

    if (parameters.marks && Array.isArray(parameters.marks)) {
      config.marks = parameters.marks as any;
    }

    if (parameters.heading_levels && Array.isArray(parameters.heading_levels)) {
      config.heading_levels = parameters.heading_levels as any;
    }

    if (typeof parameters.blocks_start_collapsed === "boolean") {
      config.blocks_start_collapsed = parameters.blocks_start_collapsed;
    }

    if (typeof parameters.show_links_target_blank === "boolean") {
      config.show_links_target_blank = parameters.show_links_target_blank;
    }

    if (typeof parameters.show_links_meta_editor === "boolean") {
      config.show_links_meta_editor = parameters.show_links_meta_editor;
    }

    // Add validators if any exist
    if (this.hasValidators()) {
      const validators: NonNullable<
        NonNullable<
          MethodNameToConfig<"addStructuredText">["body"]
        >["validators"]
      > = {};

      // Process length validator
      if (this.field.validators?.length) {
        validators.length = this.field.validators.length;
      }

      // Process structured_text_inline_blocks validator
      if (this.field.validators?.structured_text_inline_blocks) {
        const inlineBlocks = {
          ...this.field.validators.structured_text_inline_blocks,
        } as any;

        // Convert item_types from IDs to getModel/getBlock calls if they exist
        if (inlineBlocks.item_types) {
          const getCalls = this.convertItemTypeIdsToGetCalls(
            inlineBlocks.item_types,
          );
          inlineBlocks.item_types = getCalls;
        }

        validators.structured_text_inline_blocks = inlineBlocks;
      }

      // Process structured_text_blocks validator
      if (this.field.validators?.structured_text_blocks) {
        const structuredTextBlocks = {
          ...this.field.validators.structured_text_blocks,
        } as any;

        // Convert item_types from IDs to getModel/getBlock calls
        if (structuredTextBlocks.item_types) {
          const getCalls = this.convertItemTypeIdsToGetCalls(
            structuredTextBlocks.item_types,
          );
          structuredTextBlocks.item_types = getCalls;
        }

        validators.structured_text_blocks = structuredTextBlocks;
      }

      // Process structured_text_links validator
      if (this.field.validators?.structured_text_links) {
        const structuredTextLinks = {
          ...this.field.validators.structured_text_links,
        } as any;

        // Convert item_types from IDs to getModel/getBlock calls
        if (structuredTextLinks.item_types) {
          const getCalls = this.convertItemTypeIdsToGetCalls(
            structuredTextLinks.item_types,
          );
          structuredTextLinks.item_types = getCalls;
        }

        validators.structured_text_links = structuredTextLinks;
      }

      if (Object.keys(validators).length > 0) {
        body.validators = validators;
      }
    }

    // Add hint and default value
    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    // Only include body if it has content beyond api_key
    if (this.hasBodyContent(body) && Object.keys(body).length > 1) {
      return { ...config, body };
    }

    return config;
  }
}
