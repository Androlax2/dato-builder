import path from "node:path";
import { glob } from "glob";
import type { ConsoleLogger } from "../../logger.js";
import type { FileInfo } from "./types.js";

export class FileDiscoverer {
  constructor(
    private readonly blocksPath: string,
    private readonly modelsPath: string,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.traceJson("Initializing FileDiscoverer", {
      blocksPath: this.blocksPath,
      modelsPath: this.modelsPath,
    });
  }

  async discoverFiles(): Promise<Map<string, FileInfo>> {
    this.logger.trace("Starting file discovery");

    this.logger.trace("Running glob patterns for blocks and models");
    const [blockFiles, modelFiles] = await Promise.all([
      glob(`${this.blocksPath}/**/*.{ts,js}`),
      glob(`${this.modelsPath}/**/*.{ts,js}`),
    ]);

    this.logger.traceJson("Glob patterns completed", {
      blockFilesCount: blockFiles.length,
      modelFilesCount: modelFiles.length,
    });

    // Check for empty directories and log specific warnings
    if (blockFiles.length === 0) {
      this.logger.warn(
        `No block files found in "${this.blocksPath}". Ensure you have .ts or .js files in the blocks directory.`,
      );
      this.logger.traceJson("No block files discovered", {
        searchPath: this.blocksPath,
        pattern: `${this.blocksPath}/**/*.{ts,js}`,
      });
    }

    if (modelFiles.length === 0) {
      this.logger.warn(
        `No model files found in "${this.modelsPath}". Ensure you have .ts or .js files in the models directory.`,
      );
      this.logger.traceJson("No model files discovered", {
        searchPath: this.modelsPath,
        pattern: `${this.modelsPath}/**/*.{ts,js}`,
      });
    }

    const fileMap = new Map<string, FileInfo>();

    this.logger.trace("Processing block files");
    for (const file of blockFiles) {
      const name = path.basename(file, path.extname(file));
      const fileKey = `block:${name}`;
      const resolvedPath = path.resolve(file);

      this.logger.traceJson("Adding block file to map", {
        originalPath: file,
        resolvedPath,
        name,
        fileKey,
      });

      fileMap.set(fileKey, {
        name,
        type: "block",
        filePath: resolvedPath,
        dependencies: new Set(),
      });
    }

    this.logger.trace("Processing model files");
    for (const file of modelFiles) {
      const name = path.basename(file, path.extname(file));
      const fileKey = `model:${name}`;
      const resolvedPath = path.resolve(file);

      this.logger.traceJson("Adding model file to map", {
        originalPath: file,
        resolvedPath,
        name,
        fileKey,
      });

      fileMap.set(fileKey, {
        name,
        type: "model",
        filePath: resolvedPath,
        dependencies: new Set(),
      });
    }

    this.logger.traceJson("File discovery completed", {
      totalFiles: fileMap.size,
      blockFiles: blockFiles.length,
      modelFiles: modelFiles.length,
    });

    if (fileMap.size === 0) {
      this.logger.warn(
        `No blocks or models found. Please ensure you have files in "${this.blocksPath}" or "${this.modelsPath}".`,
      );
      this.logger.trace("No files found during discovery");
    } else {
      this.logger.debug(
        `Discovered ${blockFiles.length} blocks and ${modelFiles.length} models`,
      );
      this.logger.traceJson("File discovery summary", {
        totalFiles: fileMap.size,
        blockFiles: blockFiles.length,
        modelFiles: modelFiles.length,
        fileKeys: Array.from(fileMap.keys()),
      });
    }

    return fileMap;
  }
}
