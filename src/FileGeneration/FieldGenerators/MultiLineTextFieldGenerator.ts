import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

export class MultiLineTextFieldGenerator extends FieldGenerator<"addMultiLineText"> {
  getMethodCallName() {
    return "addMultiLineText" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addMultiLineText"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody();

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    const validators = this.createTextValidators();
    if (Object.keys(validators).length > 0) {
      (body as any).validators = validators;
    }

    return {
      ...config,
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
