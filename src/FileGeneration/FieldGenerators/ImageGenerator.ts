import { AssetGenerator } from "./AssetGenerator";

export class ImageGenerator extends AssetGenerator {
  getMethodName(): string {
    return "addImage";
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle file type restrictions
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
}
