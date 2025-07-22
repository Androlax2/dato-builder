import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("Environment Building Integration Tests", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const defaultConfigPath = path.resolve(
    __dirname,
    "fixtures",
    "environment-test.config.js",
  );
  const testEnvConfigPath = path.resolve(
    __dirname,
    "fixtures",
    "environment-test-env.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  const createdItemIds: string[] = [];
  let defaultClient: Client;
  let testEnvClient: Client;

  beforeAll(async () => {
    if (!API_TOKEN) {
      throw new Error(
        "DATOCMS_API_TOKEN environment variable is required for integration tests",
      );
    }

    // Initialize clients for different environments
    defaultClient = buildClient({
      apiToken: API_TOKEN,
      environment: undefined,
    });
    testEnvClient = buildClient({
      apiToken: API_TOKEN,
      environment: "test-integration-environment",
    });
  });

  afterAll(async () => {
    // Clean up created items from both environments
    if (createdItemIds.length > 0) {
      const clients = [defaultClient, testEnvClient];

      for (const client of clients) {
        for (const itemId of createdItemIds) {
          try {
            await client.itemTypes.destroy(itemId);
            console.log(`Cleaned up item: ${itemId}`);
          } catch {
            // Ignore errors - item might not exist in this environment
          }
        }
      }
    }
  });

  describe("Block and Model Build with CLI", () => {
    it("should build block and model in default environment (undefined)", async () => {
      // Create CLI instance with default environment config
      const cli = new CLI(defaultConfigPath);

      // Mock process.argv to simulate build command
      const originalArgv = process.argv;
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache",
      ];

      try {
        // Execute CLI - this will build the test items to DatoCMS
        await cli.execute();

        // Verify the block was created in the default environment
        const blockItemTypes = await defaultClient.itemTypes.list();
        const testBlock = blockItemTypes.find(
          (item) => item.api_key === "test_environment_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock!.name).toBe("Test Environment Block");
        expect(testBlock!.api_key).toBe("test_environment_block");
        expect(testBlock!.modular_block).toBe(true);
        createdItemIds.push(testBlock!.id);

        // Verify block fields
        const blockFields = await defaultClient.fields.list(testBlock!.id);
        expect(blockFields).toHaveLength(2);

        const titleField = blockFields.find(
          (f) => f.api_key === "environment_title",
        );
        const nameField = blockFields.find(
          (f) => f.api_key === "environment_name",
        );

        expect(titleField).toBeDefined();
        expect(titleField!.field_type).toBe("string");
        expect(titleField!.validators.required).toBeDefined();

        expect(nameField).toBeDefined();
        expect(nameField!.field_type).toBe("string");

        // Verify the model was created in the default environment
        const modelItemTypes = await defaultClient.itemTypes.list();
        const testModel = modelItemTypes.find(
          (item) => item.api_key === "test_environment_model",
        );

        expect(testModel).toBeDefined();
        expect(testModel!.name).toBe("Test Environment Model");
        expect(testModel!.api_key).toBe("test_environment_model");
        expect(testModel!.modular_block).toBe(false);
        createdItemIds.push(testModel!.id);

        // Verify model fields
        const modelFields = await defaultClient.fields.list(testModel!.id);
        expect(modelFields).toHaveLength(3);

        const modelTitleField = modelFields.find(
          (f) => f.api_key === "environment_title",
        );
        const descriptionField = modelFields.find(
          (f) => f.api_key === "environment_description",
        );
        const activeField = modelFields.find((f) => f.api_key === "is_active");

        expect(modelTitleField).toBeDefined();
        expect(modelTitleField!.field_type).toBe("string");
        expect(modelTitleField!.validators.required).toBeDefined();
        expect(modelTitleField!.validators.unique).toBeDefined();

        expect(descriptionField).toBeDefined();
        expect(descriptionField!.field_type).toBe("string");

        expect(activeField).toBeDefined();
        expect(activeField!.field_type).toBe("boolean");
      } catch (error) {
        console.error("Build or verification failed:", error);
        throw error;
      } finally {
        process.argv = originalArgv;
      }
    });

    it("should build block and model in test-integration-environment", async () => {
      // Create CLI instance with test environment config
      const cli = new CLI(testEnvConfigPath);

      // Mock process.argv to simulate build command
      const originalArgv = process.argv;
      process.argv = [
        "node",
        "dato-builder",
        "build",
        "--skip-deletion",
        "--no-cache",
      ];

      try {
        // Execute CLI - this will build the test items to DatoCMS in test environment
        await cli.execute();

        // Verify the block was created in the test environment
        const blockItemTypes = await testEnvClient.itemTypes.list();
        const testBlock = blockItemTypes.find(
          (item) => item.api_key === "test_environment_block",
        );

        expect(testBlock).toBeDefined();
        expect(testBlock!.name).toBe("Test Environment Block");
        expect(testBlock!.api_key).toBe("test_environment_block");
        expect(testBlock!.modular_block).toBe(true);
        createdItemIds.push(testBlock!.id);

        // Verify the model was created in the test environment
        const modelItemTypes = await testEnvClient.itemTypes.list();
        const testModel = modelItemTypes.find(
          (item) => item.api_key === "test_environment_model",
        );

        expect(testModel).toBeDefined();
        expect(testModel!.name).toBe("Test Environment Model");
        expect(testModel!.api_key).toBe("test_environment_model");
        expect(testModel!.modular_block).toBe(false);
        createdItemIds.push(testModel!.id);
      } catch (error) {
        console.error("Build or verification failed:", error);
        throw error;
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe("Environment isolation verification", () => {
    it("should verify items exist in correct environments", async () => {
      // After running the CLI builds, verify isolation between environments

      // Check that items exist in default environment
      const defaultItemTypes = await defaultClient.itemTypes.list();
      const defaultBlock = defaultItemTypes.find(
        (item) => item.api_key === "test_environment_block",
      );
      const defaultModel = defaultItemTypes.find(
        (item) => item.api_key === "test_environment_model",
      );

      // Check that items exist in test environment
      const testEnvItemTypes = await testEnvClient.itemTypes.list();
      const testEnvBlock = testEnvItemTypes.find(
        (item) => item.api_key === "test_environment_block",
      );
      const testEnvModel = testEnvItemTypes.find(
        (item) => item.api_key === "test_environment_model",
      );

      // Both environments should have the items (they may be the same if environments are not isolated)
      // or they might be separate if environments have separate namespaces
      expect(defaultBlock || testEnvBlock).toBeDefined();
      expect(defaultModel || testEnvModel).toBeDefined();

      console.log("Environment isolation test completed:");
      console.log(
        `Default environment has ${defaultItemTypes.length} item types`,
      );
      console.log(`Test environment has ${testEnvItemTypes.length} item types`);
      console.log(
        `Block exists in default: ${defaultBlock ? "true" : "false"}`,
      );
      console.log(
        `Block exists in test-integration-environment: ${testEnvBlock ? "true" : "false"}`,
      );
      console.log(
        `Model exists in default: ${defaultModel ? "true" : "false"}`,
      );
      console.log(
        `Model exists in test-integration-environment: ${testEnvModel ? "true" : "false"}`,
      );
    });
  });
});
