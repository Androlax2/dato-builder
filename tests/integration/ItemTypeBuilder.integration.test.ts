import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { DatoBuilderConfig, ItemTypeBuilderType } from "../../src";
import { createMockConfig } from "../utils/mockConfig";

// Create mock functions before mocking modules
const MockDatoApi = jest.fn();

// Mock DatoApi using unstable_mockModule for ESM compatibility
jest.unstable_mockModule("../../src/Api/DatoApi", () => ({
  default: MockDatoApi,
}));

// Import after mocking
const { default: ItemTypeBuilder } = await import("../../src/ItemTypeBuilder");

// Test ItemTypeBuilder class for integration testing
class TestItemTypeBuilder extends ItemTypeBuilder {
  constructor(
    type: ItemTypeBuilderType,
    body: any,
    overwriteConfig?: Partial<DatoBuilderConfig>,
  ) {
    super({ type, body, config: createMockConfig(overwriteConfig) });
  }
}

describe("ItemTypeBuilder Integration Tests", () => {
  let mockApiCall: jest.Mock;
  let mockClientItemTypes: any;
  let mockClientFields: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup API mocks
    mockClientItemTypes = {
      create: jest.fn(async (_body) => ({ id: "item-123" })),
      update: jest.fn(async () => ({ id: "item-123" })),
      find: jest.fn(async () => ({ id: "item-123" })),
      list: jest.fn(async () => []),
    };

    mockClientFields = {
      list: jest.fn(async () => []),
      create: jest.fn(async () => ({ id: "field-123" })),
      update: jest.fn(async () => ({ id: "field-123" })),
      destroy: jest.fn(async () => ({})),
    };

    mockApiCall = jest.fn().mockImplementation(async (fn: any) => fn());

    MockDatoApi.mockImplementation(() => ({
      client: {
        itemTypes: mockClientItemTypes,
        fields: mockClientFields,
      },
      call: mockApiCall,
    }));
  });

  describe("End-to-End Field Integration", () => {
    it("should create a complete model with multiple field types", async () => {
      const builder = new TestItemTypeBuilder("model", {
        name: "Article",
        singleton: false,
        sortable: true,
        draft_mode_active: true,
        all_locales_required: false,
      });

      // Add various field types to test integration
      builder
        .addSingleLineString({
          label: "Title",
          body: {
            validators: {
              required: true,
              unique: true,
            },
          },
        })
        .addInteger({
          label: "Views",
          body: {
            validators: {
              required: false,
              number_range: {
                min: 0,
                max: 1000000,
              },
            },
          },
        })
        .addMarkdown({
          label: "Content",
          toolbar: ["bold", "italic", "link", "code"],
          body: {
            validators: {
              required: true,
            },
          },
        });

      // Execute build
      const result = await builder.create();

      // Verify API calls
      expect(mockApiCall).toHaveBeenCalledTimes(5); // 1 for item type + 3 for fields + 1 additional internal call
      expect(mockClientItemTypes.create).toHaveBeenCalledWith({
        name: "Article",
        api_key: "article_custom_model",
        singleton: false,
        collection_appearance: "table",
        sortable: true,
        draft_mode_active: true,
        all_locales_required: false,
        modular_block: false,
      });

      // Verify fields were created
      expect(mockClientFields.create).toHaveBeenCalledTimes(3);
      expect(result).toBe("item-123");
    });

    it("should handle complex field relationships and dependencies", async () => {
      const builder = new TestItemTypeBuilder("block", {
        name: "Feature Card",
        singleton: false,
        sortable: false,
        draft_mode_active: false,
        all_locales_required: true,
      });

      // Add interdependent fields
      builder
        .addSingleLineString({
          label: "Card Title",
          body: {
            validators: {
              required: true,
              length: {
                min: 3,
                max: 100,
              },
            },
          },
        })
        .addSingleLineString({
          label: "Card Subtitle",
          body: {
            validators: {
              required: false,
              length: {
                max: 200,
              },
            },
          },
        })
        .addInteger({
          label: "Priority",
          body: {
            validators: {
              required: true,
              number_range: {
                min: 1,
                max: 10,
              },
            },
          },
        });

      const result = await builder.upsert();

      // Verify the builder handled block-specific logic
      expect(builder.body.modular_block).toBe(true);
      expect(builder.body.api_key).toBe("feature_card_custom_block");
      expect(result).toBe("item-123");
    });

    it("should maintain field order and positions correctly", async () => {
      const builder = new TestItemTypeBuilder("model", {
        name: "Product",
      });

      // Add fields in specific order
      builder
        .addSingleLineString({ label: "Name" }) // Position 1
        .addInteger({ label: "Price" }) // Position 2
        .addMarkdown({ label: "Description", toolbar: ["bold", "italic"] }); // Position 3

      await builder.create();

      // Verify field creation calls with correct positions
      const fieldCalls = mockClientFields.create.mock.calls;
      expect(fieldCalls).toHaveLength(3);

      // Check positions in field data
      const titleField = fieldCalls.find(
        (call: any) => call[1].api_key === "name",
      );
      const priceField = fieldCalls.find(
        (call: any) => call[1].api_key === "price",
      );
      const descriptionField = fieldCalls.find(
        (call: any) => call[1].api_key === "description",
      );

      expect(titleField[1].position).toBe(1);
      expect(priceField[1].position).toBe(2);
      expect(descriptionField[1].position).toBe(3);
    });
  });

  describe("Build Pipeline Integration", () => {
    it("should handle create, update, and upsert operations", async () => {
      const builder = new TestItemTypeBuilder("model", {
        name: "Test Model",
      });

      builder.addSingleLineString({ label: "Test Field" });

      // Test create operation
      const createResult = await builder.create();
      expect(createResult).toBe("item-123");
      expect(mockClientItemTypes.create).toHaveBeenCalled();

      // Reset mocks for update test
      jest.clearAllMocks();
      MockDatoApi.mockImplementation(() => ({
        client: {
          itemTypes: mockClientItemTypes,
          fields: mockClientFields,
        },
        call: mockApiCall,
      }));

      // Test update operation
      mockClientItemTypes.list.mockResolvedValueOnce([
        {
          id: "item-123",
          api_key: "test_model_custom_model",
          name: "Test Model",
        },
      ]);

      const updateResult = await builder.update();
      expect(updateResult).toBe("item-123");
      expect(mockClientItemTypes.update).toHaveBeenCalled();
    });

    it("should handle field overwriting when configured", async () => {
      const builder = new TestItemTypeBuilder("model", {
        name: "Test Model",
      });

      builder.setOverrideExistingFields(true);
      builder.addSingleLineString({
        label: "Updated Field",
        body: { api_key: "test_field" },
      });

      // Mock existing item type and fields
      mockClientItemTypes.list.mockResolvedValueOnce([
        {
          id: "item-123",
          api_key: "test_model_custom_model",
          name: "Test Model",
        },
      ]);
      mockClientFields.list.mockResolvedValueOnce([
        {
          id: "field-123",
          api_key: "test_field",
          label: "Old Field",
        },
        {
          id: "field-456",
          api_key: "to_delete",
          label: "To Delete",
        },
      ]);

      await builder.update();

      // Verify field update and deletion
      expect(mockClientFields.update).toHaveBeenCalledWith(
        "field-123",
        expect.objectContaining({
          api_key: "test_field",
          label: "Updated Field",
          position: 1,
        }),
      );
      expect(mockClientFields.destroy).toHaveBeenCalledWith("field-456");
    });
  });

  describe("Error Handling Integration", () => {
    it("should provide comprehensive error messages", async () => {
      const builder = new TestItemTypeBuilder("model", {
        name: "Test Model",
      });

      builder.addSingleLineString({ label: "Test Field" });

      // Mock API error
      const apiError = new Error("API validation failed");
      mockClientFields.create.mockRejectedValueOnce(apiError);

      await expect(builder.create()).rejects.toThrow(
        'Failed to create field "test_field": API validation failed',
      );
    });

    it("should handle duplicate field detection", async () => {
      const builder = new TestItemTypeBuilder("model", {
        name: "Test Model",
      });

      const fieldConfig = { label: "Duplicate Field" };
      builder.addSingleLineString(fieldConfig);

      expect(() => {
        builder.addSingleLineString(fieldConfig);
      }).toThrow('Field with api_key "duplicate_field" already exists.');
    });
  });

  describe("Configuration Integration", () => {
    it("should respect configuration options across field types", async () => {
      const config = {
        overwriteExistingFields: true,
        modelApiKeySuffix: "production",
        blockApiKeySuffix: "prod-block",
      };

      const modelBuilder = new TestItemTypeBuilder(
        "model",
        {
          name: "Production Model",
        },
        config,
      );

      const blockBuilder = new TestItemTypeBuilder(
        "block",
        {
          name: "Production Block",
        },
        config,
      );

      expect(modelBuilder.body.api_key).toBe("production_model_production");
      expect(blockBuilder.body.api_key).toBe("production_block_prod_block");
      expect(modelBuilder.config.overwriteExistingFields).toBe(true);
      expect(blockBuilder.config.overwriteExistingFields).toBe(true);
    });

    it("should handle unique validation correctly for different item types", async () => {
      const modelBuilder = new TestItemTypeBuilder("model", {
        name: "Test Model",
      });

      const blockBuilder = new TestItemTypeBuilder("block", {
        name: "Test Block",
      });

      // Add unique field to both
      const fieldConfig = {
        label: "Title",
        body: {
          validators: {
            unique: true,
          },
        },
      };

      modelBuilder.addSingleLineString(fieldConfig);
      blockBuilder.addSingleLineString(fieldConfig);

      await modelBuilder.create();
      await blockBuilder.create();

      // Note: This test assumes the mock calls are made in order
      // In a real scenario, you'd need better tracking of which call belongs to which builder
      expect(mockClientFields.create).toHaveBeenCalledTimes(2);
    });
  });

  describe("Performance Integration", () => {
    it("should handle large numbers of fields efficiently", async () => {
      const builder = new TestItemTypeBuilder("model", {
        name: "Large Model",
      });

      // Add many fields to test performance
      for (let i = 1; i <= 50; i++) {
        builder.addSingleLineString({
          label: `Field ${i}`,
          body: {
            validators: {
              required: i % 2 === 0,
            },
          },
        });
      }

      const startTime = Date.now();
      await builder.create();
      const endTime = Date.now();

      // Verify all fields were created
      expect(mockClientFields.create).toHaveBeenCalledTimes(50);

      // Basic performance check (should complete within reasonable time)
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
    });

    it("should batch API calls efficiently", async () => {
      const builder = new TestItemTypeBuilder("model", {
        name: "Batch Test",
      });

      builder
        .addSingleLineString({ label: "Field 1" })
        .addInteger({ label: "Field 2" })
        .addMarkdown({ label: "Field 3", toolbar: [] });

      await builder.create();

      // Verify the sequence of API calls
      expect(mockApiCall).toHaveBeenCalledTimes(5); // 1 item type + 3 fields + 1 additional internal call
      expect(mockClientItemTypes.create).toHaveBeenCalledTimes(1);
      expect(mockClientFields.create).toHaveBeenCalledTimes(3);
    });
  });
});
