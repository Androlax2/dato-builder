import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addSlug() method calls.
 */
export class SlugFieldGenerator extends FieldGenerator<"addSlug"> {
  getMethodCallName() {
    return "addSlug" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addSlug"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addSlug">;
    const body = this.buildSlugFieldBody();

    // Extract appearance parameters for the top-level config
    this.addAppearanceParameters(config);

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildSlugFieldBody(): NonNullable<
    MethodNameToConfig<"addSlug">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addSlug">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addSlugValidators(body);

    return body;
  }

  private addAppearanceParameters(config: MethodNameToConfig<"addSlug">): void {
    const appearance = this.field.appearance;

    if (appearance?.parameters) {
      const { url_prefix, placeholder } = appearance.parameters;

      if (typeof url_prefix === "string") {
        config.url_prefix = url_prefix;
      }

      if (typeof placeholder === "string") {
        config.placeholder = placeholder;
      }
    }
  }

  private addSlugValidators(
    body: NonNullable<MethodNameToConfig<"addSlug">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addSlug">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);
    this.processSlugValidators(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }

  private processSlugValidators(
    validators: NonNullable<
      NonNullable<MethodNameToConfig<"addSlug">["body"]>["validators"]
    >,
  ): void {
    const fieldValidators = this.field.validators;
    if (!fieldValidators) return;

    // Handle slug-specific validators
    if (fieldValidators.length) {
      (validators as any).length = fieldValidators.length;
    }
    if (fieldValidators.slug_format) {
      (validators as any).slug_format = fieldValidators.slug_format;
    }
    if (fieldValidators.slug_title_field) {
      (validators as any).slug_title_field = fieldValidators.slug_title_field;
    }
  }
}
