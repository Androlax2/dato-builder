import { TextGenerator } from "./TextGenerator";

export class TextareaGenerator extends TextGenerator {
  getMethodName(): string {
    return "addTextarea";
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle textarea specific options
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
