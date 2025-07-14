import { AssetGenerator } from "./AssetGenerator";

export class SingleAssetGenerator extends AssetGenerator {
  getMethodName(): string {
    return "addSingleAsset";
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle file type restrictions
    if (this.field.validators?.extension) {
      options.file_extensions = this.field.validators.extension;
    }

    return options;
  }
}
