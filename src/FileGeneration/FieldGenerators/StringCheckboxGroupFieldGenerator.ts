import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

/**
 * Generates ItemTypeBuilder method calls for StringCheckboxGroup field types.
 * Handles JSON fields with string_checkbox_group editor.
 */
export class StringCheckboxGroupFieldGenerator extends FieldGenerator<"addStringCheckboxGroup"> {
  getMethodCallName() {
    return "addStringCheckboxGroup" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addStringCheckboxGroup"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody() as any;

    // Extract options from appearance parameters
    const options = this.extractOptionsFromAppearance();

    // Add validators if any exist
    if (this.hasValidators()) {
      const validators: NonNullable<
        NonNullable<
          MethodNameToConfig<"addStringCheckboxGroup">["body"]
        >["validators"]
      > = {};

      this.processRequiredValidator(validators);

      if (Object.keys(validators).length > 0) {
        body.validators = validators;
      }
    }

    // Add hint and default value
    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    const result: MethodNameToConfig<"addStringCheckboxGroup"> = {
      ...config,
      options,
    };

    // Only include body if it has content beyond api_key
    if (this.hasBodyContent(body) && Object.keys(body).length > 1) {
      result.body = body;
    }

    return result;
  }

  private extractOptionsFromAppearance() {
    const parameters = this.field.appearance?.parameters;
    if (
      !parameters ||
      !parameters.options ||
      !Array.isArray(parameters.options)
    ) {
      return [];
    }

    return parameters.options.map((option: any) => ({
      label: option.label || "",
      value: option.value || "",
      ...(option.hint && { hint: option.hint }),
    }));
  }
}
