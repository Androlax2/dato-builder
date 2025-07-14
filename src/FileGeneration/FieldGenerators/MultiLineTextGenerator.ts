import { TextGenerator } from "./TextGenerator";

export class MultiLineTextGenerator extends TextGenerator {
  getMethodName(): string {
    return "addMultiLineText";
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle basic multi-line text options
    if (this.field.appearance?.parameters?.placeholder) {
      options.placeholder = this.field.appearance.parameters.placeholder;
    }

    // Fallback for common placeholder handling
    if (this.field.appearance?.placeholder && !options.placeholder) {
      options.placeholder = this.field.appearance.placeholder;
    }

    return options;
  }
}
