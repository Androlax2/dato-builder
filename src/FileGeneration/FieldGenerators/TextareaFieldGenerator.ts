import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

export class TextareaFieldGenerator extends FieldGenerator<"addTextarea"> {
  getMethodCallName() {
    return "addTextarea" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addTextarea"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody();

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    const validators = this.createTextValidators();
    if (Object.keys(validators).length > 0) {
      (body as any).validators = validators;
    }

    const placeholder = this.field.appearance?.parameters?.placeholder as
      | string
      | undefined;

    return {
      ...config,
      ...(placeholder && { placeholder }),
      ...(this.hasBodyContent(body) && { body }),
    };
  }

  private createTextValidators() {
    const validators: {
      required?: boolean;
      length?: { min?: number; max?: number };
      format?: { predefined_pattern?: string; custom_pattern?: RegExp };
      sanitized_html?: { sanitize_before_validation: boolean };
    } = {};

    this.processRequiredValidator(validators);
    this.processLengthValidator(validators);
    this.processFormatValidator(validators);

    if (this.field.validators?.sanitized_html) {
      validators.sanitized_html = {
        sanitize_before_validation: true,
      };
    }

    return validators;
  }
}
