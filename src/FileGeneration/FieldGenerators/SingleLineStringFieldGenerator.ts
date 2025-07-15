import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class SingleLineStringFieldGenerator extends FieldGenerator<"addSingleLineString"> {
  getMethodCallName() {
    return "addSingleLineString" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addSingleLineString"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody();

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);
    this.addValidatorsToBody(body);

    // Extract appearance parameters
    const options = this.extractSingleLineStringOptions();

    return {
      ...config,
      ...(options && { options }),
      ...(this.hasBodyContent(body) && { body }),
    };
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

  private addValidatorsToBody(
    body: NonNullable<MethodNameToConfig<"addSingleLineString">>["body"],
  ): void {
    if (!this.hasValidators()) {
      return;
    }

    const validators = {} as NonNullable<
      NonNullable<MethodNameToConfig<"addSingleLineString">>["body"]
    >["validators"];

    this.processRequiredValidator(validators);

    // Copy all validators from field to body
    if (this.field.validators) {
      Object.assign(validators, this.field.validators);
    }

    if (Object.keys(validators).length > 0) {
      body.validators = validators;
    }
  }
}
