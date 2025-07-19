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

    const testGenerator = plop.setGenerator("test", {
      description: "Test generator",
      prompts: [
        {
          type: "input",
          name: "name",
          message: "Enter a name for the test:",
          validate: (value: string) => {
            if (!value) return "Name is required";
            return true;
          },
        },
      ],
      actions: [
        {
          type: "add",
          path: `${this.config.modelsPath}/{{name}}.ts`,
          templateFile: join(__dirname, "plop-templates", "test.hbs"),
        },
      ],
    });

    testGenerator
      .runPrompts()
      .then((answers) => {
        return testGenerator
          .runActions(answers)
          .then((ok: any) => {
            if (ok.failures.length > 0) {
              this.logger.errorJson(
                "Failed to generate test files:",
                ok.failures,
              );
            } else {
              this.logger.success("Test files generated successfully!");
            }
          })
          .catch((error: any) => {
            this.logger.error(`Error generating test: ${error.message}`);
          });
      })
      .catch((error: any) => {
        this.logger.error(`Error generating test: ${error.message}`);
      });
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
