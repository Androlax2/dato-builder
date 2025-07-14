import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type {
  ItemTypeBuilderAddMethods,
  MethodNameToConfig,
} from "@/types/ItemTypeBuilderFields";

export interface FieldGeneratorConfig {
  field: Field;
}

export abstract class FieldGenerator<
  TMethodName extends ItemTypeBuilderAddMethods,
> {
  protected field: Field;

  constructor(config: FieldGeneratorConfig) {
    this.field = config.field;
  }

  /**
   * Get the name of the method that will be called in the generated code.
   * @example
   * getMethodCallName() {
   *    return "addDate";
   * }
   */
  abstract getMethodCallName(): TMethodName;

  abstract generateBuildConfig(): MethodNameToConfig<TMethodName>;

  public generateMethodCall(): string {
    const methodName = this.getMethodCallName();
    const config = this.generateBuildConfig();

    return `.${methodName}(${this.serializeConfig(config)})`;
  }

  private serializeConfig(obj: any): string {
    if (obj === null) return "null";
    if (obj === undefined) return "undefined";
    if (typeof obj === "string") return JSON.stringify(obj);
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
    if (obj instanceof Date)
      return `new Date(${JSON.stringify(obj.toISOString())})`;

    if (Array.isArray(obj)) {
      return `[${obj.map((item) => this.serializeConfig(item)).join(", ")}]`;
    }

    if (typeof obj === "object") {
      const entries = Object.entries(obj)
        .map(([key, value]) => `${key}: ${this.serializeConfig(value)}`)
        .join(", ");
      return `{ ${entries} }`;
    }

    return JSON.stringify(obj);
  }
}
