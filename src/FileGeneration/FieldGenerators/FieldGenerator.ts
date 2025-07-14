import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import type {
  ItemTypeBuilderAddMethods,
  MethodNameToConfig,
} from "@/types/ItemTypeBuilderFields";

export interface FieldGeneratorConfig {
  field: Field;
  needsAsync: boolean;
  itemTypeReferences: Map<string, ItemType>;
}

export abstract class FieldGenerator<
  TMethodName extends ItemTypeBuilderAddMethods,
> {
  protected field: Field;
  protected needsAsync: boolean;
  protected itemTypeReferences: Map<string, ItemType>;

  constructor(config: FieldGeneratorConfig) {
    this.field = config.field;
    this.needsAsync = config.needsAsync;
    this.itemTypeReferences = config.itemTypeReferences;
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
    throw new Error(
      "Implement generateMethodCall in FieldGenerator parent class",
    );
  }
}
