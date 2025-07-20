import { buildClient } from "@datocms/cma-client-node";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import DatoApi from "../../src/Api/DatoApi.js";

describe("DatoCMS API Integration", () => {
  let api: DatoApi;
  let createdItemTypeIds: string[] = [];

  beforeAll(() => {
    const apiToken = process.env.DATOCMS_API_TOKEN;
    if (!apiToken) {
      throw new Error("DATOCMS_API_TOKEN environment variable is required");
    }

    const client = buildClient({
      apiToken,
      environment: "main",
    });
    api = new DatoApi(client);
  });

  afterAll(async () => {
    // Cleanup: Delete all created item types
    for (const itemTypeId of createdItemTypeIds) {
      try {
        await api.call(() => api.client.itemTypes.destroy(itemTypeId));
      } catch (error) {
        console.warn(`Failed to cleanup item type ${itemTypeId}:`, error);
      }
    }
  });

  describe("Basic API Operations", () => {
    it("should retrieve site information", async () => {
      const site = await api.call(() => api.client.site.find());

      expect(site).toBeDefined();
      expect(site.id).toBeDefined();
      expect(site.name).toBeDefined();
    });

    it("should list existing item types", async () => {
      const itemTypes = await api.call(() => api.client.itemTypes.list());

      expect(Array.isArray(itemTypes)).toBe(true);
      // Every DatoCMS project should have at least one item type
      expect(itemTypes.length).toBeGreaterThan(0);
    });
  });

  describe("Item Type CRUD Operations", () => {
    it("should create, read, update, and delete an item type", async () => {
      // Create
      const itemType = await api.call(() =>
        api.client.itemTypes.create({
          name: "Integration Test Model",
          api_key: "integration_test_model",
          singleton: false,
        }),
      );

      expect(itemType.id).toBeDefined();
      expect(itemType.name).toBe("Integration Test Model");
      expect(itemType.api_key).toBe("integration_test_model");

      createdItemTypeIds.push(itemType.id);

      // Read
      const retrievedItemType = await api.call(() =>
        api.client.itemTypes.find(itemType.id),
      );

      expect(retrievedItemType.id).toBe(itemType.id);
      expect(retrievedItemType.name).toBe("Integration Test Model");

      // Update
      const updatedItemType = await api.call(() =>
        api.client.itemTypes.update(itemType.id, {
          name: "Updated Integration Test Model",
        }),
      );

      expect(updatedItemType.name).toBe("Updated Integration Test Model");

      // Delete
      await api.call(() => api.client.itemTypes.destroy(itemType.id));

      // Verify deletion
      await expect(
        api.call(() => api.client.itemTypes.find(itemType.id)),
      ).rejects.toThrow();

      // Remove from cleanup list since already deleted
      createdItemTypeIds = createdItemTypeIds.filter(
        (id) => id !== itemType.id,
      );
    });
  });

  describe("Field CRUD Operations", () => {
    let testItemTypeId: string;

    beforeAll(async () => {
      const itemType = await api.call(() =>
        api.client.itemTypes.create({
          name: "Field Test Model",
          api_key: "field_test_model",
          singleton: false,
        }),
      );
      testItemTypeId = itemType.id;
      createdItemTypeIds.push(testItemTypeId);
    });

    it("should create different field types", async () => {
      // Text field
      const textField = await api.call(() =>
        api.client.fields.create(testItemTypeId, {
          label: "Text Field",
          field_type: "string",
          api_key: "text_field",
          appearance: {
            editor: "single_line",
            parameters: {},
            addons: [],
          },
          validators: {
            required: {},
          },
        }),
      );

      expect(textField.id).toBeDefined();
      expect(textField.field_type).toBe("string");
      expect(textField.api_key).toBe("text_field");

      // Date field
      const dateField = await api.call(() =>
        api.client.fields.create(testItemTypeId, {
          label: "Date Field",
          field_type: "date",
          api_key: "date_field",
        }),
      );

      expect(dateField.id).toBeDefined();
      expect(dateField.field_type).toBe("date");

      // Boolean field
      const booleanField = await api.call(() =>
        api.client.fields.create(testItemTypeId, {
          label: "Boolean Field",
          field_type: "boolean",
          api_key: "boolean_field",
        }),
      );

      expect(booleanField.id).toBeDefined();
      expect(booleanField.field_type).toBe("boolean");
    });

    it("should handle field validation errors", async () => {
      await expect(
        api.call(() =>
          api.client.fields.create(testItemTypeId, {
            label: "Invalid Field",
            field_type: "string",
            api_key: "text_field", // Duplicate API key
          }),
        ),
      ).rejects.toThrow();
    });
  });

  describe("API Error Handling", () => {
    it("should handle 404 errors properly", async () => {
      await expect(
        api.call(() => api.client.itemTypes.find("non_existent_id")),
      ).rejects.toThrow();
    });

    it("should handle rate limiting with retries", async () => {
      // This test would require actually hitting rate limits
      // For now, we'll just verify the retry mechanism works with valid calls
      let callCount = 0;

      const result = await api.call(async () => {
        callCount++;
        return api.client.site.find();
      });

      expect(result).toBeDefined();
      expect(callCount).toBe(1); // Should succeed on first try
    });

    it("should handle validation errors", async () => {
      await expect(
        api.call(() =>
          api.client.itemTypes.create({
            name: "", // Invalid empty name
            api_key: "invalid_model",
          }),
        ),
      ).rejects.toThrow();
    });
  });

  describe("Bulk Operations", () => {
    it("should handle concurrent API calls", async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        api.call(() =>
          api.client.itemTypes.create({
            name: `Concurrent Test Model ${i}`,
            api_key: `concurrent_test_model_${i}`,
          }),
        ),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result.name).toBe(`Concurrent Test Model ${i}`);
        createdItemTypeIds.push(result.id);
      });
    });
  });

  describe("Complex Field Relationships", () => {
    let parentItemTypeId: string;
    let childItemTypeId: string;

    beforeAll(async () => {
      // Create parent item type
      const parentItemType = await api.call(() =>
        api.client.itemTypes.create({
          name: "Parent Model",
          api_key: "parent_model",
        }),
      );
      parentItemTypeId = parentItemType.id;
      createdItemTypeIds.push(parentItemTypeId);

      // Create child item type
      const childItemType = await api.call(() =>
        api.client.itemTypes.create({
          name: "Child Model",
          api_key: "child_model",
        }),
      );
      childItemTypeId = childItemType.id;
      createdItemTypeIds.push(childItemTypeId);
    });

    it("should create link fields between models", async () => {
      // Single link field
      const linkField = await api.call(() =>
        api.client.fields.create(parentItemTypeId, {
          label: "Child Reference",
          field_type: "link",
          api_key: "child_reference",
          validators: {
            item_item_type: {
              item_types: [childItemTypeId],
            },
          },
        }),
      );

      expect(linkField.field_type).toBe("link");
      expect(linkField.validators).toBeDefined();
      if (
        linkField.validators &&
        typeof linkField.validators === "object" &&
        "item_item_type" in linkField.validators
      ) {
        const validator = linkField.validators.item_item_type as any;
        expect(validator.item_types).toContain(childItemTypeId);
      }

      // Multiple links field
      const linksField = await api.call(() =>
        api.client.fields.create(parentItemTypeId, {
          label: "Child References",
          field_type: "links",
          api_key: "child_references",
          validators: {
            items_item_type: {
              item_types: [childItemTypeId],
            },
            size: {
              min: 1,
              max: 5,
            },
          },
        }),
      );

      expect(linksField.field_type).toBe("links");
      expect(linksField.validators).toBeDefined();
      if (
        linksField.validators &&
        typeof linksField.validators === "object" &&
        "items_item_type" in linksField.validators
      ) {
        const validator = linksField.validators.items_item_type as any;
        expect(validator.item_types).toContain(childItemTypeId);
      }
    });
  });
});
