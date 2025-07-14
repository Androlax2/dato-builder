import type { ConsoleLogger } from "../../logger";
import type { FileInfo } from "./types";

export class DependencyResolver {
  constructor(private readonly logger: ConsoleLogger) {
    this.logger.trace("Initializing DependencyResolver");
  }

  topologicalSort(fileMap: Map<string, FileInfo>): string[] {
    this.logger.traceJson("Starting topological sort", {
      fileCount: fileMap.size,
    });

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (fileKey: string) => {
      this.logger.traceJson("Visiting node", {
        fileKey,
        visited: visited.size,
        visiting: visiting.size,
      });

      if (visiting.has(fileKey)) {
        this.logger.errorJson("Circular dependency detected", {
          fileKey,
          visiting: Array.from(visiting),
        });
        throw new Error(`Circular dependency detected involving: ${fileKey}`);
      }

      if (visited.has(fileKey)) {
        this.logger.traceJson("Node already visited, skipping", { fileKey });
        return;
      }

      this.logger.traceJson("Adding node to visiting set", { fileKey });
      visiting.add(fileKey);

      const fileInfo = fileMap.get(fileKey);
      if (fileInfo) {
        this.logger.traceJson("Processing dependencies", {
          fileKey,
          dependencyCount: fileInfo.dependencies.size,
          dependencies: Array.from(fileInfo.dependencies),
        });

        for (const dep of Array.from(fileInfo.dependencies)) {
          if (fileMap.has(dep)) {
            this.logger.traceJson("Visiting dependency", {
              fileKey,
              dependency: dep,
            });
            visit(dep);
          } else {
            this.logger.warn(`Dependency "${dep}" not found for ${fileKey}`);
            this.logger.traceJson("Dependency not found in file map", {
              fileKey,
              dependency: dep,
            });
          }
        }
      } else {
        this.logger.traceJson("File info not found for key", { fileKey });
      }

      this.logger.traceJson(
        "Removing node from visiting set and adding to visited",
        { fileKey },
      );
      visiting.delete(fileKey);
      visited.add(fileKey);
      result.push(fileKey);
      this.logger.traceJson("Node added to result", {
        fileKey,
        resultLength: result.length,
      });
    };

    this.logger.trace("Starting traversal of all file keys");
    for (const fileKey of Array.from(fileMap.keys())) {
      if (!visited.has(fileKey)) {
        this.logger.traceJson("Starting visit for unvisited node", { fileKey });
        visit(fileKey);
      } else {
        this.logger.traceJson("Skipping already visited node", { fileKey });
      }
    }

    this.logger.traceJson("Topological sort completed", {
      totalNodes: fileMap.size,
      resultLength: result.length,
      result: result,
    });

    return result;
  }
}
