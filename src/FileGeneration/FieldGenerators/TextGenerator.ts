import { FieldGenerator } from "./FieldGenerator";

// Base class for all text-related generators
export abstract class TextGenerator extends FieldGenerator {
  abstract getMethodName(): string;

  generateMethodCall(): string {
    const config = this.generateConfig();
    return `\n    .${this.getMethodName()}(${this.objectToString(config, 2)})`;
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    if (this.field.appearance?.parameters?.placeholder) {
      options.placeholder = this.field.appearance.parameters.placeholder;
    }

    return options;
  }
}
