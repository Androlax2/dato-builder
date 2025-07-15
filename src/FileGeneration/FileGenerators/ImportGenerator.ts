export class ImportGenerator {
  private static readonly BUILDER_CONTEXT_IMPORT =
    'import type { BuilderContext } from "../../types/BuilderContext";';
  private static readonly IMPORT_PATH_PREFIX = "../../";

  public generateImports(builderClass: string): string {
    if (builderClass === null || builderClass === undefined) {
      throw new Error(
        "Invalid input: builderClass cannot be null or undefined",
      );
    }

    const builderImport = this.createBuilderImport(builderClass);
    return `${builderImport};
${ImportGenerator.BUILDER_CONTEXT_IMPORT}`;
  }

  private createBuilderImport(builderClass: string): string {
    return `import ${builderClass} from "${ImportGenerator.IMPORT_PATH_PREFIX}${builderClass}"`;
  }
}
