import { dirname, join } from "node:path";
import type { NodePlopAPI } from "node-plop";
import type { ConsoleLogger } from "../logger";
import type { DatoBuilderConfig } from "../types/DatoBuilderConfig";

interface ResultChange {
  type: string;
  path: string;
}

export interface GenerationResult {
  success: boolean;
  type: string;
  changes: ResultChange[];
  errors?: string[];
}

type RunActionsFunction = ReturnType<NodePlopAPI["getGenerator"]>["runActions"];
type RunActionsReturn = ReturnType<RunActionsFunction>;

export class PlopGenerator {
  private readonly config: Required<DatoBuilderConfig>;
  private readonly logger: ConsoleLogger;

  constructor(config: Required<DatoBuilderConfig>, logger: ConsoleLogger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Setup plop instance with all generators
   */
  private async setupPlop(): Promise<NodePlopAPI> {
    // Use Function constructor to create dynamic import that works in compiled CommonJS
    const dynamicImport = new Function("specifier", "return import(specifier)");
    const { default: nodePlop } = await dynamicImport("node-plop");
    const plop = await nodePlop();

    const __dirname = dirname(__filename);
    const plopTemplatesPath = join(__dirname, "..", "plop-templates");

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

    return plop;
  }

  /**
   * Process generation result and handle success/failure
   */
  private processResult(
    result: Awaited<RunActionsReturn>,
    generatorType: string,
  ): GenerationResult {
    if (result.failures.length > 0) {
      const errors = result.failures.map((failure) => failure.error);

      this.logger.error("Generation failed:");
      for (const error of errors) {
        this.logger.error(`  ${error}`);
      }

      return {
        success: false,
        type: generatorType,
        changes: [],
        errors,
      };
    }

    this.logger.success(`Successfully generated ${generatorType}!`);
    for (const change of result.changes) {
      this.logger.info(`  ${change.type}: ${change.path}`);
    }

    return {
      success: true,
      type: generatorType,
      changes: result.changes,
    };
  }

  /**
   * Generate with interactive selection
   */
  public async generateInteractive(): Promise<GenerationResult> {
    const plop = await this.setupPlop();

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

    return this.generateSpecific(generator, plop);
  }

  /**
   * Generate a specific type directly
   */
  public async generateSpecific(
    generatorType: "block" | "model",
    existingPlop?: NodePlopAPI,
  ): Promise<GenerationResult> {
    const plop = existingPlop || (await this.setupPlop());

    const selectedGenerator = plop.getGenerator(generatorType);
    const answers = await selectedGenerator.runPrompts();
    const result = await selectedGenerator.runActions(answers);

    const processedResult = this.processResult(result, generatorType);

    if (!processedResult.success) {
      throw new Error("Generation failed");
    }

    return processedResult;
  }
}
