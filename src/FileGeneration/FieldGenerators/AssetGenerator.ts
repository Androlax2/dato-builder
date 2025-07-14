import { FieldGenerator } from "./FieldGenerator";

// Base class for all asset-related generators
export abstract class AssetGenerator extends FieldGenerator {
  abstract getMethodName(): string;

  generateMethodCall(): string {
    const config = this.generateConfig();
    return `\n    .${this.getMethodName()}(${this.objectToString(config, 2)})`;
  }

  protected processValidators(validators: Record<string, any>): any {
    const processed = super.processValidators(validators);

    // Handle asset-specific validators
    if (validators.file_size) {
      processed.file_size = validators.file_size;
    }

    if (validators.extension) {
      processed.extension = validators.extension;
    }

    if (validators.required_alt_title) {
      processed.required_alt_title = validators.required_alt_title;
    }

    // Handle image-specific validators
    if (validators.image_dimensions) {
      processed.image_dimensions = validators.image_dimensions;
    }

    if (validators.image_aspect_ratio) {
      processed.image_aspect_ratio = validators.image_aspect_ratio;
    }

    return processed;
  }
}
