import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

/**
 * Generates ItemTypeBuilder method calls for JSON field types.
 * Handles plain JSON fields without specific editors.
 */
export class JsonFieldGenerator extends FieldGenerator<"addJson"> {
  getMethodCallName() {
    return "addJson" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addJson"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody() as any;

    // Add validators if any exist
    if (this.hasValidators()) {
      const validators: NonNullable<
        NonNullable<MethodNameToConfig<"addJson">["body"]>["validators"]
      > = {};

      this.processRequiredValidator(validators);

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
