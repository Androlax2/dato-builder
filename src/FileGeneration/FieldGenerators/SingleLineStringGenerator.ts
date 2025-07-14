import { TextGenerator } from "./TextGenerator";

export class SingleLineStringGenerator extends TextGenerator {
  getMethodName(): string {
    return "addSingleLineString";
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle single line string specific options
    if (this.field.appearance?.parameters?.heading) {
      options.heading = this.field.appearance.parameters.heading;
    }

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
