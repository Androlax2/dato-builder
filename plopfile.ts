import type { NodePlopAPI } from "plop";

export default function (plop: NodePlopAPI) {
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
        path: "src/datocms/blocks/{{name}}.ts",
        templateFile: "plop-templates/block.hbs",
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
        path: "src/datocms/models/{{name}}.ts",
        templateFile: "plop-templates/model.hbs",
      },
    ],
  });

  // Helper to convert PascalCase to snake_case for API keys
  plop.setHelper("snakeCase", (text: string) =>
    text
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, ""),
  );
}
