import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

export class MarkdownFieldGenerator extends FieldGenerator<"addMarkdown"> {
  getMethodCallName() {
    return "addMarkdown" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addMarkdown"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody();

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    const validators = this.createTextValidators();
    if (Object.keys(validators).length > 0) {
      (body as any).validators = validators;
    }

    const toolbar = this.extractToolbarFromParameters() as Array<
      | "heading"
      | "bold"
      | "italic"
      | "strikethrough"
      | "code"
      | "unordered_list"
      | "ordered_list"
      | "quote"
      | "link"
      | "image"
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
      format?: { predefined_pattern?: string; custom_pattern?: RegExp };
      sanitized_html?: { sanitize_before_validation: boolean };
    } = {};

    // Use the proper validator processing methods
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

  private extractToolbarFromParameters(): string[] {
    const toolbar = this.field.appearance?.parameters?.toolbar;
    if (Array.isArray(toolbar)) {
      return toolbar;
    }
    return [];
  }
}
