import { BaseFieldGenerator } from "./BaseFieldGenerator";

export class TextFieldGenerator extends BaseFieldGenerator {
  getMethodName(): string {
    return "addText";
  }

  generateMethodCall(): string {
    const config = this.generateConfig();
    return `\n    .${this.getMethodName()}(${this.objectToString(config, 2)})`;
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle placeholder from appearance
    if (this.field.appearance?.placeholder) {
      options.placeholder = this.field.appearance.placeholder;
    }

    // Handle heading option
    if (this.field.appearance?.parameters?.heading) {
      options.heading = this.field.appearance.parameters.heading;
    }

    return options;
  }
}
