import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type {
  ItemTypeBuilderAddMethods,
  MethodNameToConfig,
} from "@/types/ItemTypeBuilderFields";

/**
 * Base class for number field generators (Integer, Float)
 * Consolidates common number field logic
 */
export abstract class NumberFieldGenerator<
  TMethodName extends ItemTypeBuilderAddMethods,
> extends FieldGenerator<TMethodName> {
  generateBuildConfig(): MethodNameToConfig<TMethodName> {
    const config = this.createBaseConfig() as MethodNameToConfig<TMethodName>;
    const body = this.buildFieldBody();

    if (this.hasBodyContent(body)) {
      this.addOptionalProperty(config, "body", body);
    }

    return config;
  }

  protected override buildFieldBody(): NonNullable<
    MethodNameToConfig<TMethodName>["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<TMethodName>["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addValidatorsToBody(body);

    return body;
  }

  protected override addFieldSpecificValidators(
    validators: Record<string, unknown>,
  ): void {
    // Handle number-specific validators
    if (this.field.validators?.["number_range"]) {
      this.addOptionalProperty(
        validators,
        "number_range",
        this.field.validators["number_range"],
      );
    }
  }
}
