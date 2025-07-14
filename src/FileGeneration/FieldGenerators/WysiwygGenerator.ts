import { TextGenerator } from "./TextGenerator";

export class WysiwygGenerator extends TextGenerator {
  getMethodName(): string {
    return "addWysiwyg";
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle wysiwyg specific options
    if (this.field.appearance?.parameters?.toolbar) {
      options.toolbar = this.field.appearance.parameters.toolbar;
    }

    return options;
  }
}
