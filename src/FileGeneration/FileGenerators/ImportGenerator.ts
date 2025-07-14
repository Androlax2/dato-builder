export class ImportGenerator {
  generateImports(builderClass: string): string {
    return `import ${builderClass} from "../../${builderClass}";
import type { BuilderContext } from "../../types/BuilderContext";`;
  }
}
