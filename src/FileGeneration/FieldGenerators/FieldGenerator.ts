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

    return `${methodName}(${JSON.stringify(config)})`;
  }
}
