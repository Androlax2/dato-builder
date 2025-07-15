import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

export class WysiwygFieldGenerator extends FieldGenerator<"addWysiwyg"> {
  getMethodCallName() {
    return "addWysiwyg" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addWysiwyg"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody();

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    const validators = this.createTextValidators();
    if (Object.keys(validators).length > 0) {
      (body as any).validators = validators;
    }

    const toolbar = this.extractToolbarFromParameters() as Array<
      | "format"
      | "bold"
      | "italic"
      | "strikethrough"
      | "code"
      | "ordered_list"
      | "unordered_list"
      | "quote"
      | "table"
      | "link"
      | "image"
      | "show_source"
      | "undo"
      | "redo"
      | "align_left"
      | "align_center"
      | "align_right"
      | "align_justify"
      | "outdent"
      | "indent"
      | "fullscreen"
    >;

    return {
      ...config,
      toolbar,
      ...(this.hasBodyContent(body) && { body }),
    };
  }

  private createTextValidators() {
    const validators: {
      required?: boolean;
      length?: { min?: number; max?: number };
      format?: { predefined_pattern?: string; custom_pattern?: string };
      sanitized_html?: boolean;
    } = {};

    this.processRequiredValidator(validators);

    if (this.field.validators?.length) {
      const length = this.field.validators.length as any;
      const lengthValidator: { min?: number; max?: number } = {};

      if (length.min !== undefined) lengthValidator.min = length.min;
      if (length.max !== undefined) lengthValidator.max = length.max;

      if (Object.keys(lengthValidator).length > 0) {
        validators.length = lengthValidator;
      }
    }

    if (this.field.validators?.format) {
      const format = this.field.validators.format as any;
      const formatValidator: {
        predefined_pattern?: string;
        custom_pattern?: string;
      } = {};

      if (format.predefined_pattern)
        formatValidator.predefined_pattern = format.predefined_pattern;
      if (format.custom_pattern)
        formatValidator.custom_pattern = format.custom_pattern;

      if (Object.keys(formatValidator).length > 0) {
        validators.format = formatValidator;
      }
    }

    if (this.field.validators?.sanitized_html) {
      validators.sanitized_html = true;
    }

    return validators;
  }

  private extractToolbarFromParameters(): string[] {
    const toolbar = this.field.appearance?.parameters?.toolbar;
    if (Array.isArray(toolbar)) {
      return toolbar;
    }
    return [];
  }
}
