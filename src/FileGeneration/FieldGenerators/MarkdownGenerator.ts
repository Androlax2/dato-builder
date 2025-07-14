import { TextGenerator } from "./TextGenerator";

export class MarkdownGenerator extends TextGenerator {
  getMethodName(): string {
    return "addMarkdown";
  }

  protected generateFieldOptions(): any {
    const options: any = {};

    // Handle markdown specific options
    if (this.field.appearance?.parameters?.toolbar) {
      options.toolbar = this.field.appearance.parameters.toolbar;
    }

    return options;
  }
}
