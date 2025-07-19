import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addAssetGallery() method calls.
 */
export class GalleryFieldGenerator extends FieldGenerator<"addAssetGallery"> {
  getMethodCallName() {
    return "addAssetGallery" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addAssetGallery"> {
    const config =
      this.createBaseConfig() as MethodNameToConfig<"addAssetGallery">;
    const body = this.buildGalleryFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildGalleryFieldBody(): NonNullable<
    MethodNameToConfig<"addAssetGallery">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addAssetGallery">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addGalleryValidators(body);

    return body;
  }

  private addGalleryValidators(
    body: NonNullable<MethodNameToConfig<"addAssetGallery">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addAssetGallery">["body"]>["validators"]
    >;

    // Gallery fields support specific validators but not 'required'
    this.processGalleryValidators(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }

  private processGalleryValidators(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addAssetGallery">["body"]>["validators"]
    >,
  ): void {
    const fieldValidators = this.field.validators;
    if (!fieldValidators) return;

    // Handle gallery-specific validators
    if (fieldValidators.size) {
      (validators as any).size = fieldValidators.size;
    }
    if (fieldValidators.file_size) {
      (validators as any).file_size = fieldValidators.file_size;
    }
    if (fieldValidators.image_dimensions) {
      (validators as any).image_dimensions = fieldValidators.image_dimensions;
    }
    if (fieldValidators.image_aspect_ratio) {
      (validators as any).image_aspect_ratio =
        fieldValidators.image_aspect_ratio;
    }
    if (fieldValidators.extension) {
      (validators as any).extension = fieldValidators.extension;
    }
    if (fieldValidators.required_alt_title) {
      (validators as any).required_alt_title =
        fieldValidators.required_alt_title;
    }
  }
}
