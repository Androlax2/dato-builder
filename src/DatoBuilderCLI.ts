import { dirname, join } from "node:path";
import type { NodePlopAPI, PlopCfg } from "plop";
import type { CacheManager } from "./cache/CacheManager";
import { RunCommand } from "./commands/run/RunCommand";
import type { ConsoleLogger } from "./logger";
import type { DatoBuilderConfig } from "./types/DatoBuilderConfig";

interface BaseCommandOptions {
  config: Required<DatoBuilderConfig>;
  cache: CacheManager;
  logger: ConsoleLogger;
}

interface BuildCommandOptions {
  enableDeletion?: boolean;
  skipDeletionConfirmation?: boolean;
  concurrency?: number;
}

export class DatoBuilderCLI {
  private readonly config: Required<DatoBuilderConfig>;
  private readonly cache: CacheManager;
  private readonly logger: ConsoleLogger;

  constructor(options: BaseCommandOptions) {
    this.config = options.config;
    this.cache = options.cache;
    this.logger = options.logger;
  }

  /**
   * Execute the build command
   */
  public async build(options: BuildCommandOptions = {}): Promise<void> {
    this.logger.trace("Starting build command execution");

    await new RunCommand({
      config: this.config,
      cache: this.cache,
      logger: this.logger,
      enableDeletion: options.enableDeletion,
      skipDeletionConfirmation: options.skipDeletionConfirmation,
      concurrency: options.concurrency ?? 1,
    }).execute();

    this.logger.trace("Build command execution completed");
  }

  /**
   * Generate Blocks and Models
   */
  public async generate(): Promise<void> {
    // Use Function constructor to avoid TypeScript transpilation of dynamic import
    const importNodePlop = new Function(
      'return import("node-plop")',
    ) as () => Promise<{
      default: (
        plopfilePath?: string,
        plopCfg?: PlopCfg,
      ) => Promise<NodePlopAPI>;
    }>;
    const { default: nodePlop } = await importNodePlop();
    const plop = await nodePlop();

    const __dirname = dirname(__filename);
    const plopTemplatesPath = join(__dirname, "plop-templates");

    // Block generator
    plop.setGenerator("block", {
      description: "Generate a new DatoCMS block",
      prompts: [
        {
          type: "input",
          name: "name",
          message: "Block name (PascalCase):",
          validate: (value: string) => {
            if (!value) return "Block name is required";

            if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
              return "Block name must be in PascalCase (e.g., MyNewBlock)";
            }

            return true;
          },
        },
      ],
      actions: [
        {
          type: "add",
          path: `${this.config.blocksPath}/{{name}}.ts`,
          templateFile: `${plopTemplatesPath}/block.hbs`,
        },
      ],
    });

    // Model generator
    plop.setGenerator("model", {
      description: "Generate a new DatoCMS model",
      prompts: [
        {
          type: "input",
          name: "name",
          message: "Model name (PascalCase):",
          validate: (value: string) => {
            if (!value) return "Model name is required";

            if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
              return "Model name must be in PascalCase (e.g., BlogPost)";
            }

            return true;
          },
        },
        {
          type: "confirm",
          name: "singleton",
          message: "Is this a singleton model?",
          default: false,
        },
        {
          type: "confirm",
          name: "sortable",
          message: "Should records be sortable?",
          default: false,
        },
        {
          type: "confirm",
          name: "tree",
          message: "Should records be organized in a tree structure?",
          default: false,
        },
      ],
      actions: [
        {
          type: "add",
          path: `${this.config.modelsPath}/{{name}}.ts`,
          templateFile: `${plopTemplatesPath}/model.hbs`,
        },
      ],
    });

    // Start the interactive generator selection
    const { default: inquirer } = await import("inquirer");

    const generators = plop.getGeneratorList();
    const choices = generators.map((g) => ({
      name: `${g.name} - ${g.description}`,
      value: g.name,
    }));

    const { generator } = await inquirer.prompt([
      {
        type: "list",
        name: "generator",
        message: "What do you want to generate?",
        choices,
      },
    ]);

    const selectedGenerator = plop.getGenerator(generator);
    const answers = await selectedGenerator.runPrompts();
    const result = await selectedGenerator.runActions(answers);

    if (result.failures.length > 0) {
      this.logger.error("Generation failed:");

      for (const failure of result.failures) {
        this.logger.error(`  ${failure.error}`);
      }

      throw new Error("Generation failed");
    }

    this.logger.success(`Successfully generated ${generator}!`);

    for (const change of result.changes) {
      this.logger.info(`  ${change.type}: ${change.path}`);
    }
  }

  /**
   * Clear all caches
   */
  public async clearCache(): Promise<void> {
    this.logger.trace("Starting cache clear operation");

    await this.cache.clear();

    this.logger.success("All caches cleared!");
    this.logger.trace("Cache clear operation completed");
  }
}
