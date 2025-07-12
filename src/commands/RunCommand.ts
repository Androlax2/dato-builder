import path from "node:path";
import { glob } from "glob";
import type BlockBuilder from "../BlockBuilder";
import type { ConsoleLogger } from "../logger";
import type ModelBuilder from "../ModelBuilder";
import type { BuilderContext } from "../types/BuilderContext";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";

type RunCommandOptions = {
  config: Required<DatoBuilderConfig>;
  logger: ConsoleLogger;
  /**
   * Path to the directory containing block files.
   *
   * @default "./datocms/blocks"
   */
  blocksPath?: string | null;
  /**
   * Path to the directory containing model files.
   *
   * @default "./datocms/models"
   */
  modelsPath?: string | null;
};

export class RunCommand {
  private readonly config: Required<DatoBuilderConfig>;
  private readonly blocksPath: string;
  private readonly modelsPath: string;
  private readonly logger: ConsoleLogger;

  private blockCache = new Map<string, string>();
  private modelCache = new Map<string, string>();

  private buildPromises = new Map<string, Promise<string>>();

  private fileMap = new Map<string, string>();

  constructor({ config, logger, blocksPath, modelsPath }: RunCommandOptions) {
    this.config = config;
    this.blocksPath = blocksPath ?? "./datocms/blocks";
    this.modelsPath = modelsPath ?? "./datocms/models";
    this.logger = logger;
  }

  public async execute() {
    await this.discoverAllFiles();

    if (this.fileMap.size === 0) {
      return;
    }

    const [blockFiles, modelFiles] = await Promise.all([
      this.getBlockFiles(),
      this.getModelFiles(),
    ]);

    // Process all files and execute their builders
    const allFiles = [...blockFiles, ...modelFiles];
    this.logger.info(`Processing ${allFiles.length} files...`);

    const results = await Promise.allSettled(
      allFiles.map(async (file) => {
        const name = this.getNameFromFilePath(file);
        const type = this.getTypeFromFilePath(file);

        try {
          if (type === "block") {
            const result = await this.getOrCreateBlock(name);
            this.logger.success(`Built block "${name}" with ID: ${result}`);
            return result;
          } else {
            const result = await this.getOrCreateModel(name);
            this.logger.success(`Built model "${name}" with ID: ${result}`);
            return result;
          }
        } catch (error: unknown) {
          this.logger.error(
            `Failed to build ${type} "${name}": ${
              (error as Error).message || "Unknown error"
            }`,
          );
          throw error;
        }
      }),
    );

    // Report results
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    this.logger.info(
      `Build completed: ${successful} successful, ${failed} failed`,
    );
  }

  private getContext(): BuilderContext {
    return {
      config: this.config,
      getBlock: (name: string) => this.getOrCreateBlock(name),
      getModel: (name: string) => this.getOrCreateModel(name),
    };
  }

  private async getOrCreateBlock(name: string): Promise<string> {
    // Return cached ID if already built
    const cachedId = this.blockCache.get(name);
    if (cachedId) {
      return cachedId;
    }

    // Return existing promise if currently building (prevents duplicate builds)
    const existingPromise = this.buildPromises.get(`block:${name}`);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new build promise
    const buildPromise = this.buildBlock(name);
    this.buildPromises.set(`block:${name}`, buildPromise);

    try {
      const itemTypeId = await buildPromise;
      this.blockCache.set(name, itemTypeId);
      return itemTypeId;
    } finally {
      this.buildPromises.delete(`block:${name}`);
    }
  }

  private async getOrCreateModel(name: string): Promise<string> {
    // Return cached ID if already built
    const cachedId = this.modelCache.get(name);
    if (cachedId) {
      return cachedId;
    }

    // Return existing promise if currently building (prevents duplicate builds)
    const existingPromise = this.buildPromises.get(`model:${name}`);
    if (existingPromise) {
      return existingPromise;
    }

    const buildPromise = this.buildModel(name);
    this.buildPromises.set(`model:${name}`, buildPromise);

    try {
      const itemTypeId = await buildPromise;
      this.modelCache.set(name, itemTypeId);
      return itemTypeId;
    } finally {
      this.buildPromises.delete(`model:${name}`);
    }
  }

  private async buildBlock(name: string): Promise<string> {
    const filePath = this.fileMap.get(`block:${name}`);

    if (!filePath) {
      throw new Error(
        `Block "${name}" not found. Available blocks: ${Array.from(
          this.fileMap.keys(),
        )
          .filter((k) => k.startsWith("block:"))
          .map((k) => k.replace("block:", ""))
          .join(", ")}`,
      );
    }

    const createBlock = await import(filePath);
    const buildFunction = createBlock.default;

    if (typeof buildFunction !== "function") {
      throw new Error(`Block "${name}" does not export a default function`);
    }

    const builder = (await buildFunction(this.getContext())) as BlockBuilder;

    return await builder.upsert();
  }

  private async buildModel(name: string): Promise<string> {
    const filePath = this.fileMap.get(`model:${name}`);

    if (!filePath) {
      throw new Error(
        `Model "${name}" not found. Available models: ${Array.from(
          this.fileMap.keys(),
        )
          .filter((k) => k.startsWith("model:"))
          .map((k) => k.replace("model:", ""))
          .join(", ")}`,
      );
    }

    const createModel = await import(filePath);
    const buildFunction = createModel.default;

    if (typeof buildFunction !== "function") {
      throw new Error(`Model "${name}" does not export a default function`);
    }

    const builder = (await buildFunction(this.getContext())) as ModelBuilder;

    return await builder.upsert();
  }

  private async discoverAllFiles() {
    const [blockFiles, modelFiles] = await Promise.all([
      glob(`${this.blocksPath}/**/*.{ts,js}`),
      glob(`${this.modelsPath}/**/*.{ts,js}`),
    ]);

    for (const file of blockFiles) {
      const name = path.basename(file, path.extname(file));
      this.fileMap.set(`block:${name}`, path.resolve(file));
    }

    for (const file of modelFiles) {
      const name = path.basename(file, path.extname(file));
      this.fileMap.set(`model:${name}`, path.resolve(file));
    }

    if (this.fileMap.size === 0) {
      this.logger.warn(
        `No blocks or models found. Please ensure you have files in "${this.blocksPath}" or "${this.modelsPath}".`,
      );
    } else {
      this.logger.info(
        `Discovered ${blockFiles.length} blocks and ${modelFiles.length} models`,
      );
    }
  }

  private getBlockFiles() {
    return Array.from(this.fileMap.entries())
      .filter(([key]) => key.startsWith("block:"))
      .map(([, filePath]) => filePath);
  }

  private getModelFiles() {
    return Array.from(this.fileMap.entries())
      .filter(([key]) => key.startsWith("model:"))
      .map(([, filePath]) => filePath);
  }

  private getNameFromFilePath(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }

  private getTypeFromFilePath(filePath: string): "block" | "model" {
    const entry = Array.from(this.fileMap.entries()).find(
      ([, path]) => path === filePath,
    );

    if (!entry) throw new Error(`File path not found: ${filePath}`);

    return entry[0].startsWith("block:") ? "block" : "model";
  }
}
