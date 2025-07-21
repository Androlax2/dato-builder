import path from "node:path";
import { buildClient, type Client } from "@datocms/cma-client-node";
import { afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import { CLI } from "../../../src/cli.js";

describe("MixedDependencies Integration Test", () => {
  const testConfigPath = path.resolve(
    process.cwd(),
    "tests/integration/mixed-dependencies/dato-builder.config.js",
  );
  const API_TOKEN = process.env.DATOCMS_API_TOKEN;
  let createdItemTypeIds: string[] = [];
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
    if (createdItemTypeIds.length > 0) {
      // Clean up any created item types
      for (const itemTypeId of createdItemTypeIds) {
        try {
          await datoClient.itemTypes.destroy(itemTypeId);
          console.log(`Successfully cleaned up test item type: ${itemTypeId}`);
        } catch (error) {
          console.warn("Error during cleanup:", error);
        }
      }
      createdItemTypeIds = [];
    }
  });

  describe("Complex Mixed Block and Model Dependencies", () => {
    it("should build a complete project with blocks, models, and cross-references", async () => {
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

        // Verify that all blocks and models were created in DatoCMS
        const itemTypes = await datoClient.itemTypes.list();

        // Find all our test item types
        const contentBlock = itemTypes.find(
          (item: any) => item.api_key === "content_block",
        );
        const mediaBlock = itemTypes.find(
          (item: any) => item.api_key === "media_block",
        );
        const authorModel = itemTypes.find(
          (item: any) => item.api_key === "author",
        );
        const articleModel = itemTypes.find(
          (item: any) => item.api_key === "article",
        );

        // Verify all item types were created
        expect(contentBlock).toBeDefined();
        expect(contentBlock!.name).toBe("Content Block");
        expect(contentBlock!.api_key).toBe("content_block");

        expect(mediaBlock).toBeDefined();
        expect(mediaBlock!.name).toBe("Media Block");
        expect(mediaBlock!.api_key).toBe("media_block");

        expect(authorModel).toBeDefined();
        expect(authorModel!.name).toBe("Author");
        expect(authorModel!.api_key).toBe("author");

        expect(articleModel).toBeDefined();
        expect(articleModel!.name).toBe("Article");
        expect(articleModel!.api_key).toBe("article");

        // Track the created item types for cleanup
        createdItemTypeIds.push(
          articleModel!.id,
          authorModel!.id,
          mediaBlock!.id,
          contentBlock!.id,
        );

        // Verify ContentBlock fields
        const contentBlockFields = await datoClient.fields.list(
          contentBlock!.id,
        );
        expect(contentBlockFields).toHaveLength(3);

        const contentTitleField = contentBlockFields.find(
          (field: any) => field.api_key === "content_title",
        );
        const contentBodyField = contentBlockFields.find(
          (field: any) => field.api_key === "content_body",
        );
        const featuredField = contentBlockFields.find(
          (field: any) => field.api_key === "featured",
        );

        expect(contentTitleField).toBeDefined();
        expect(contentTitleField!.field_type).toBe("string");
        expect(contentTitleField!.validators.required).toBeDefined();

        expect(contentBodyField).toBeDefined();
        expect(contentBodyField!.field_type).toBe("string");

        expect(featuredField).toBeDefined();
        expect(featuredField!.field_type).toBe("boolean");

        // Verify MediaBlock dependencies (should reference ContentBlock)
        const mediaBlockFields = await datoClient.fields.list(mediaBlock!.id);
        const relatedContentField = mediaBlockFields.find(
          (field: any) => field.api_key === "related_content",
        );

        expect(relatedContentField).toBeDefined();
        expect(relatedContentField!.field_type).toBe("rich_text");
        expect(relatedContentField!.validators.rich_text_blocks).toBeDefined();
        expect(
          (relatedContentField!.validators.rich_text_blocks as any).item_types,
        ).toContain(contentBlock!.id);

        // Verify Author model fields
        const authorFields = await datoClient.fields.list(authorModel!.id);
        expect(authorFields).toHaveLength(4);

        const authorNameField = authorFields.find(
          (field: any) => field.api_key === "name",
        );
        const authorEmailField = authorFields.find(
          (field: any) => field.api_key === "email",
        );

        expect(authorNameField).toBeDefined();
        expect(authorNameField!.field_type).toBe("string");
        expect(authorNameField!.validators.required).toBeDefined();

        expect(authorEmailField).toBeDefined();
        expect(authorEmailField!.field_type).toBe("string");
        expect(authorEmailField!.validators.format).toBeDefined();

        // Verify Article model dependencies (should reference Author model and both blocks)
        const articleFields = await datoClient.fields.list(articleModel!.id);

        const authorField = articleFields.find(
          (field: any) => field.api_key === "author",
        );
        const contentField = articleFields.find(
          (field: any) => field.api_key === "content",
        );

        // Verify author link field
        expect(authorField).toBeDefined();
        expect(authorField!.field_type).toBe("link");
        expect(
          (authorField!.validators.item_item_type as any).item_types,
        ).toContain(authorModel!.id);

        // Verify content modular field references both blocks
        expect(contentField).toBeDefined();
        expect(contentField!.field_type).toBe("rich_text");
        expect(contentField!.validators.rich_text_blocks).toBeDefined();
        const contentBlockTypes = (
          contentField!.validators.rich_text_blocks as any
        ).item_types;
        expect(contentBlockTypes).toContain(contentBlock!.id);
        expect(contentBlockTypes).toContain(mediaBlock!.id);
        expect(contentBlockTypes).toHaveLength(2);
      } catch (error) {
        console.error("Mixed dependency build failed:", error);
        throw error;
      } finally {
        // Restore original process.argv
        process.argv = originalArgv;
      }
    });
  });
});
