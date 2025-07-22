import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("ModelDependencies Integration Test", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const testConfigPath = path.resolve(
    __dirname,
    "fixtures",
    "model-dependencies.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  const createdModels: string[] = [];
  let datoClient: Client;

  beforeAll(async () => {
    // Ensure we have a DatoCMS API token for integration tests
    if (!API_TOKEN) {
      throw new Error(
        "DATOCMS_API_TOKEN environment variable is required for integration tests",
      );
    }

    // Initialize DatoCMS client
    datoClient = buildClient({ apiToken: API_TOKEN });
  });

  afterEach(async () => {
    // Cleanup created models after tests
    if (createdModels.length > 0) {
      try {
        for (const modelId of createdModels) {
          await datoClient.itemTypes.destroy(modelId);
          console.log(`Successfully cleaned up test model: ${modelId}`);
        }
      } catch (error) {
        console.error("Failed to clean up created models:", error);
      }
    }
  });

  describe("Async Model Dependencies", () => {
    it("should build models with async getModel() dependencies in correct order", async () => {
      // Store original process.argv to restore later
      const originalArgv = process.argv;

      try {
        // Simulate CLI command: npx dato-builder build --skip-deletion --no-cache
        process.argv = [
          "node",
          "dato-builder",
          "build",
          "--skip-deletion",
          "--no-cache",
        ];

        const cli = new CLI(testConfigPath);
        await cli.execute();

        // Verify that both models were created in DatoCMS
        const itemTypes = await datoClient.itemTypes.list();

        const baseModel = itemTypes.find(
          (item: any) => item.api_key === "test_base_model",
        );
        const referenceModel = itemTypes.find(
          (item: any) => item.api_key === "test_reference_model",
        );

        expect(baseModel).toBeDefined();
        expect(baseModel!.name).toBe("Test Base Model");
        expect(baseModel!.api_key).toBe("test_base_model");

        expect(referenceModel).toBeDefined();
        expect(referenceModel!.name).toBe("Test Reference Model");
        expect(referenceModel!.api_key).toBe("test_reference_model");

        // Track the created models for cleanup
        createdModels.push(baseModel!.id, referenceModel!.id);

        // Verify that reference model has correct field linking to base model
        const referenceFields = await datoClient.fields.list(
          referenceModel!.id,
        );
        const referenceField = referenceFields.find(
          (field: any) => field.api_key === "base_model_reference",
        );

        expect(referenceField).toBeDefined();
        expect(referenceField!.field_type).toBe("link");
        expect(
          (referenceField!.validators.item_item_type as any).item_types,
        ).toContain(baseModel!.id);

        // Verify that dependency order was correct by checking that the reference field
        // points to the base model (which means base model was built first)
        expect(
          (referenceField!.validators.item_item_type as any).item_types[0],
        ).toBe(baseModel!.id);
      } catch (error) {
        console.error("Model dependency build failed:", error);
        throw error;
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    });
  });
});
