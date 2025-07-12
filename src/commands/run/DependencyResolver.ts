import type { ConsoleLogger } from "../../logger";
import type { FileInfo } from "./types";

export class DependencyResolver {
  constructor(private logger: ConsoleLogger) {}

  topologicalSort(fileMap: Map<string, FileInfo>): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (fileKey: string) => {
      if (visiting.has(fileKey)) {
        throw new Error(`Circular dependency detected involving: ${fileKey}`);
      }

      if (visited.has(fileKey)) {
        return;
      }

      visiting.add(fileKey);

      const fileInfo = fileMap.get(fileKey);
      if (fileInfo) {
        for (const dep of Array.from(fileInfo.dependencies)) {
          if (fileMap.has(dep)) {
            visit(dep);
          } else {
            this.logger.warn(`Dependency "${dep}" not found for ${fileKey}`);
          }
        }
      }

      visiting.delete(fileKey);
      visited.add(fileKey);
      result.push(fileKey);
    };

    for (const fileKey of Array.from(fileMap.keys())) {
      if (!visited.has(fileKey)) {
        visit(fileKey);
      }
    }

    return result;
  }
}
