import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

/**
 * Generates ItemTypeBuilder.addLocation() method calls.
 */
export class LocationFieldGenerator extends FieldGenerator<"addLocation"> {
  getMethodCallName() {
    return "addLocation" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addLocation"> {
    const config = this.createBaseConfig() as MethodNameToConfig<"addLocation">;
    const body = this.buildLocationFieldBody();

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildLocationFieldBody(): NonNullable<
    MethodNameToConfig<"addLocation">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addLocation">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addLocationValidators(body);

    return body;
  }

  private addLocationValidators(
    body: NonNullable<MethodNameToConfig<"addLocation">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addLocation">["body"]>["validators"]
    >;

    this.processRequiredValidator(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }
}
