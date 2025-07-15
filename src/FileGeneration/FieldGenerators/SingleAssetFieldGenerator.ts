import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addSingleAsset() method calls.
 */
export class SingleAssetFieldGenerator extends FieldGenerator<"addSingleAsset"> {
  getMethodCallName() {
    return "addSingleAsset" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addSingleAsset"> {
    const config =
      this.createBaseConfig() as MethodNameToConfig<"addSingleAsset">;
    const body = this.buildSingleAssetFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildSingleAssetFieldBody(): NonNullable<
    MethodNameToConfig<"addSingleAsset">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addSingleAsset">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addSingleAssetValidators(body);

    return body;
  }

  private addSingleAssetValidators(
    body: NonNullable<MethodNameToConfig<"addSingleAsset">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addSingleAsset">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);
    this.processSingleAssetValidators(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }

  private processSingleAssetValidators(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addSingleAsset">["body"]>["validators"]
    >,
  ): void {
    const fieldValidators = this.field.validators;
    if (!fieldValidators) return;

    // Handle single asset specific validators (similar to gallery)
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
