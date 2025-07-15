import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addSeo() method calls.
 */
export class SeoFieldGenerator extends FieldGenerator<"addSeo"> {
  getMethodCallName() {
    return "addSeo" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addSeo"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addSeo">;
    const body = this.buildSeoFieldBody();

    // Extract appearance parameters for the top-level config
    this.addAppearanceParameters(config);

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildSeoFieldBody(): NonNullable<
    MethodNameToConfig<"addSeo">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addSeo">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addSeoValidators(body);

    return body;
  }

  private addAppearanceParameters(config: MethodNameToConfig<"addSeo">): void {
    const appearance = this.field.appearance;

    if (appearance?.parameters) {
      const { fields, previews } = appearance.parameters;

      if (Array.isArray(fields)) {
        config.fields = fields;
      }

      if (Array.isArray(previews)) {
        config.previews = previews;
      }
    }
  }

  private addSeoValidators(
    body: NonNullable<MethodNameToConfig<"addSeo">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addSeo">["body"]>["validators"]
    >;

    // SEO fields support specific validators but not 'required'
    this.processSeoValidators(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }

  private processSeoValidators(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addSeo">["body"]>["validators"]
    >,
  ): void {
    const fieldValidators = this.field.validators;
    if (!fieldValidators) return;

    // Handle SEO-specific validators
    if (fieldValidators.required_seo_fields) {
      (validators as any).required_seo_fields =
        fieldValidators.required_seo_fields;
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
    if (fieldValidators.title_length) {
      (validators as any).title_length = fieldValidators.title_length;
    }
    if (fieldValidators.description_length) {
      (validators as any).description_length =
        fieldValidators.description_length;
    }
  }
}
