import path from "node:path";
import { glob } from "glob";
import type { ConsoleLogger } from "../../logger";
import type { FileInfo } from "./types";

export class FileDiscoverer {
  constructor(
    private blocksPath: string,
    private modelsPath: string,
    private logger: ConsoleLogger,
  ) {}

  async discoverFiles(): Promise<Map<string, FileInfo>> {
    const [blockFiles, modelFiles] = await Promise.all([
      glob(`${this.blocksPath}/**/*.{ts,js}`),
      glob(`${this.modelsPath}/**/*.{ts,js}`),
    ]);

    const fileMap = new Map<string, FileInfo>();

    for (const file of blockFiles) {
      const name = path.basename(file, path.extname(file));
      fileMap.set(`block:${name}`, {
        name,
        type: "block",
        filePath: path.resolve(file),
        dependencies: new Set(),
      });
    }

    for (const file of modelFiles) {
      const name = path.basename(file, path.extname(file));
      fileMap.set(`model:${name}`, {
        name,
        type: "model",
        filePath: path.resolve(file),
        dependencies: new Set(),
      });
    }

    if (fileMap.size === 0) {
      this.logger.warn(
        `No blocks or models found. Please ensure you have files in "${this.blocksPath}" or "${this.modelsPath}".`,
      );
    } else {
      this.logger.debug(
        `Discovered ${blockFiles.length} blocks and ${modelFiles.length} models`,
      );
    }

    return fileMap;
  }
}
