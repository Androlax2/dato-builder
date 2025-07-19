export class ImportGenerator {
  private readonly isLocalDevelopment: boolean;

  constructor(isLocalDevelopment = false) {
    this.isLocalDevelopment = isLocalDevelopment;
  }

  public generateImports(builderClass: string): string {
    if (builderClass === null || builderClass === undefined) {
      throw new Error(
        "Invalid input: builderClass cannot be null or undefined",
      );
    }

    const builderImport = this.createBuilderImport(builderClass);
    const contextImport = this.createBuilderContextImport();
    return `${builderImport};
${contextImport}`;
  }

  private createBuilderImport(builderClass: string): string {
    if (this.isLocalDevelopment) {
      return `import ${builderClass} from "@/${builderClass}"`;
    }
    return `import { ${builderClass} } from "dato-builder"`;
  }

  private createBuilderContextImport(): string {
    if (this.isLocalDevelopment) {
      return 'import type { BuilderContext } from "@/types/BuilderContext";';
    }
    return 'import type { BuilderContext } from "dato-builder";';
  }
}
