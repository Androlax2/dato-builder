import path from "node:path";
import { glob } from "glob";
import type { DatoBuilderConfig } from "../config/types";
import type { ConsoleLogger } from "../logger";

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
    // 1. Discover and map all files first
    await this.discoverAllFiles();

    if (this.fileMap.size === 0) {
      return;
    }

    console.log(this);

    /* // 2. Process all files
    const blockFiles = await this.getBlockFiles();
    const modelFiles = await this.getModelFiles();

    // 3. Build everything (with automatic deduplication)
    const context = {
      config: this.config,
      getBlock: (name: string) => this.getOrCreateBlock(name),
      getModel: (name: string) => this.getOrCreateModel(name),
    };

    // Process all files but don't execute builders yet
    for (const file of [...blockFiles, ...modelFiles]) {
      const createFn = await import(file);
    }*/
  }

  private async getOrCreateBlock(name: string): Promise<string> {
    // Return cached ID if already built
    if (this.blockCache.has(name)) {
      return this.blockCache.get(name)!;
    }

    // Return existing promise if currently building (prevents duplicate builds)
    if (this.buildPromises.has(`block:${name}`)) {
      return this.buildPromises.get(`block:${name}`)!;
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
    if (this.modelCache.has(name)) {
      return this.modelCache.get(name)!;
    }

    if (this.buildPromises.has(`model:${name}`)) {
      return this.buildPromises.get(`model:${name}`)!;
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
    const builder = createBlock.default({
      config: this.config,
      getBlock: (n: string) => this.getOrCreateBlock(n),
      getModel: (n: string) => this.getOrCreateModel(n),
    });

    const itemTypeId = await builder.upsert();

    return itemTypeId;
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
    const builder = createModel.default({
      config: this.config,
      getBlock: (n: string) => this.getOrCreateBlock(n),
      getModel: (n: string) => this.getOrCreateModel(n),
    });

    const itemTypeId = await builder.upsert();

    return itemTypeId;
  }

  private async discoverAllFiles() {
    const blockFiles = await glob(`${this.blocksPath}/**/*.{ts,js}`);
    const modelFiles = await glob(`${this.modelsPath}/**/*.{ts,js}`);

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
}
