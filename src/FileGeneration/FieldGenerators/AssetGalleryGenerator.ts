import { AssetGenerator } from "./AssetGenerator";

export class AssetGalleryGenerator extends AssetGenerator {
  getMethodName(): string {
    return "addAssetGallery";
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle file type restrictions
    if (this.field.validators?.extension) {
      options.file_extensions = this.field.validators.extension;
    }

    // Handle image dimension restrictions for galleries
    if (this.field.validators?.image_dimensions) {
      options.image_dimensions = this.field.validators.image_dimensions;
    }

    return options;
  }
}
