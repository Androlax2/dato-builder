import { BaseFieldGenerator } from "./BaseFieldGenerator";

export class ImageFieldGenerator extends BaseFieldGenerator {
  getMethodName(): string {
    return "addImage";
  }

  generateMethodCall(): string {
    const config = this.generateConfig();
    return `\n    .${this.getMethodName()}(${this.objectToString(config, 2)})`;
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle file type restrictions if any
    if (this.field.validators?.extension) {
      options.file_extensions = this.field.validators.extension;
    }

    // Handle image dimension restrictions
    if (this.field.validators?.image_dimensions) {
      options.image_dimensions = this.field.validators.image_dimensions;
    }

    // Handle image aspect ratio restrictions
    if (this.field.validators?.image_aspect_ratio) {
      options.image_aspect_ratio = this.field.validators.image_aspect_ratio;
    }

    return options;
  }

  protected processValidators(validators: Record<string, any>): any {
    const processed = super.processValidators(validators);

    // Handle image-specific validators
    if (validators.file_size) {
      processed.file_size = validators.file_size;
    }

    if (validators.image_dimensions) {
      processed.image_dimensions = validators.image_dimensions;
    }

    if (validators.image_aspect_ratio) {
      processed.image_aspect_ratio = validators.image_aspect_ratio;
    }

    if (validators.extension) {
      processed.extension = validators.extension;
    }

    if (validators.required_alt_title) {
      processed.required_alt_title = validators.required_alt_title;
    }

    return processed;
  }
}
