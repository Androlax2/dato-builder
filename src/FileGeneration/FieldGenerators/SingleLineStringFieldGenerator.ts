import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class SingleLineStringFieldGenerator extends FieldGenerator<"addSingleLineString"> {
  getMethodCallName() {
    return "addSingleLineString" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addSingleLineString"> {
    const config =
      this.createBaseConfig() as MethodNameToConfig<"addSingleLineString">;
    const body = this.buildSingleLineStringFieldBody();

    // Extract appearance parameters
    const options = this.extractSingleLineStringOptions();

    if (options) {
      config.options = options;
    }

    if (this.hasBodyContent(body)) {
      config.body = body;
    }

    return config;
  }

  private buildSingleLineStringFieldBody(): NonNullable<
    MethodNameToConfig<"addSingleLineString">["body"]
  > {
    const body = this.createBaseBody() as NonNullable<
      MethodNameToConfig<"addSingleLineString">["body"]
    >;

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addSingleLineStringValidators(body);

    return body;
  }

  private extractSingleLineStringOptions(): MethodNameToConfig<"addSingleLineString">["options"] {
    const parameters = this.field.appearance?.parameters as any;

    if (!parameters) {
      return undefined;
    }

    const options: NonNullable<
      MethodNameToConfig<"addSingleLineString">["options"]
    > = {};

    if (typeof parameters.heading === "boolean") {
      options.heading = parameters.heading;
    }

    if (typeof parameters.placeholder === "string" && parameters.placeholder) {
      options.placeholder = parameters.placeholder;
    }

    return Object.keys(options).length > 0 ? options : undefined;
  }

  private addSingleLineStringValidators(
    body: NonNullable<MethodNameToConfig<"addSingleLineString">["body"]>,
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<
        MethodNameToConfig<"addSingleLineString">["body"]
      >["validators"]
    >;

    // Process each validator type individually to ensure proper conversion
    this.processRequiredValidator(validators);
    this.processUniqueValidator(validators);
    this.processLengthValidator(validators);
    this.processFormatValidator(validators);
    this.processEnumValidator(validators);

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }
}
