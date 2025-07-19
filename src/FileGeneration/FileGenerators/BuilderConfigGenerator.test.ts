import type { ItemType } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { BuilderConfigGenerator } from "@/FileGeneration/FileGenerators/BuilderConfigGenerator";

describe("BuilderConfigGenerator", () => {
  let generator: BuilderConfigGenerator;
  let baseItemType: ItemType;

  beforeEach(() => {
    generator = new BuilderConfigGenerator();

    baseItemType = {
      id: "test-item-type-id",
      type: "item_type",
      name: "Test Item Type",
      api_key: "test_item_type",
      singleton: false,
      sortable: true,
      draft_mode_active: false,
      all_locales_required: false,
      hint: "Test hint",
      collection_appearance: "table",
      modular_block: false,
      draft_saving_active: false,
      tree: false,
      ordering_direction: null,
      ordering_field: null,
      inverse_relationships_enabled: false,
      title_field: null,
      image_preview_field: null,
      excerpt_field: null,
      workflow: null,
      has_singleton_item: false,
      name_singular: null,
      ordering_meta: null,
    } as unknown as ItemType;
  });

  describe("generateBuilderConfig for models", () => {
    it("should generate correct config for basic model", () => {
      const result = generator.generateBuilderConfig(baseItemType, "model");

      expect(result).toBe(`{
      name: 'Test Item Type',
      config,
      body: {
        api_key: 'test_item_type',
        singleton: false,
        sortable: true,
        draft_mode_active: false,
        all_locales_required: false,
      },
    }`);
    });

    it("should handle singleton model", () => {
      const singletonItemType: ItemType = {
        ...baseItemType,
        singleton: true,
      };

      const result = generator.generateBuilderConfig(
        singletonItemType,
        "model",
      );

      expect(result).toContain("singleton: true");
    });

    it("should handle non-sortable model", () => {
      const nonSortableItemType: ItemType = {
        ...baseItemType,
        sortable: false,
      };

      const result = generator.generateBuilderConfig(
        nonSortableItemType,
        "model",
      );

      expect(result).toContain("sortable: false");
    });

    it("should handle draft mode active", () => {
      const draftModeItemType: ItemType = {
        ...baseItemType,
        draft_mode_active: true,
      };

      const result = generator.generateBuilderConfig(
        draftModeItemType,
        "model",
      );

      expect(result).toContain("draft_mode_active: true");
    });

    it("should handle all locales required", () => {
      const allLocalesItemType: ItemType = {
        ...baseItemType,
        all_locales_required: true,
      };

      const result = generator.generateBuilderConfig(
        allLocalesItemType,
        "model",
      );

      expect(result).toContain("all_locales_required: true");
    });

    it("should handle undefined boolean values as false", () => {
      const itemTypeWithUndefined: ItemType = {
        ...baseItemType,
        singleton: undefined as any,
        sortable: undefined as any,
        draft_mode_active: undefined as any,
        all_locales_required: undefined as any,
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithUndefined,
        "model",
      );

      expect(result).toContain("singleton: false");
      expect(result).toContain("sortable: false");
      expect(result).toContain("draft_mode_active: false");
      expect(result).toContain("all_locales_required: false");
    });

    it("should handle null boolean values as false", () => {
      const itemTypeWithNull: ItemType = {
        ...baseItemType,
        singleton: null as any,
        sortable: null as any,
        draft_mode_active: null as any,
        all_locales_required: null as any,
      };

      const result = generator.generateBuilderConfig(itemTypeWithNull, "model");

      expect(result).toContain("singleton: false");
      expect(result).toContain("sortable: false");
      expect(result).toContain("draft_mode_active: false");
      expect(result).toContain("all_locales_required: false");
    });

    it("should escape single quotes in model name", () => {
      const itemTypeWithQuotes: ItemType = {
        ...baseItemType,
        name: "Test's Model Name",
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithQuotes,
        "model",
      );

      expect(result).toContain("name: 'Test\\'s Model Name'");
    });

    it("should escape single quotes in api_key", () => {
      const itemTypeWithQuotes: ItemType = {
        ...baseItemType,
        api_key: "test's_api_key",
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithQuotes,
        "model",
      );

      expect(result).toContain("api_key: 'test\\'s_api_key'");
    });
  });

  describe("generateBuilderConfig for blocks", () => {
    it("should generate correct config for basic block", () => {
      const result = generator.generateBuilderConfig(baseItemType, "block");

      expect(result).toBe(`{
      name: 'Test Item Type',
      config,
      options: {
        api_key: 'test_item_type',
        hint: 'Test hint',
      },
    }`);
    });

    it("should handle empty hint", () => {
      const itemTypeWithEmptyHint: ItemType = {
        ...baseItemType,
        hint: "",
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithEmptyHint,
        "block",
      );

      expect(result).toContain("hint: ''");
    });

    it("should handle undefined hint", () => {
      const itemTypeWithUndefinedHint: ItemType = {
        ...baseItemType,
        hint: undefined as any,
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithUndefinedHint,
        "block",
      );

      expect(result).toContain("hint: ''");
    });

    it("should handle null hint", () => {
      const itemTypeWithNullHint: ItemType = {
        ...baseItemType,
        hint: null as any,
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithNullHint,
        "block",
      );

      expect(result).toContain("hint: ''");
    });

    it("should escape single quotes in block name", () => {
      const itemTypeWithQuotes: ItemType = {
        ...baseItemType,
        name: "Test's Block Name",
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithQuotes,
        "block",
      );

      expect(result).toContain("name: 'Test\\'s Block Name'");
    });

    it("should escape single quotes in api_key", () => {
      const itemTypeWithQuotes: ItemType = {
        ...baseItemType,
        api_key: "test's_api_key",
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithQuotes,
        "block",
      );

      expect(result).toContain("api_key: 'test\\'s_api_key'");
    });

    it("should escape single quotes in hint", () => {
      const itemTypeWithQuotes: ItemType = {
        ...baseItemType,
        hint: "This is a test's hint",
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithQuotes,
        "block",
      );

      expect(result).toContain("hint: 'This is a test\\'s hint'");
    });

    it("should handle multiline hints", () => {
      const itemTypeWithMultilineHint: ItemType = {
        ...baseItemType,
        hint: "Line 1\nLine 2\nLine 3",
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithMultilineHint,
        "block",
      );

      expect(result).toContain("hint: 'Line 1\nLine 2\nLine 3'");
    });

    it("should handle hints with special characters", () => {
      const itemTypeWithSpecialChars: ItemType = {
        ...baseItemType,
        hint: "Special chars: !@#$%^&*()[]{}|;:,.<>?",
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithSpecialChars,
        "block",
      );

      expect(result).toContain("hint: 'Special chars: !@#$%^&*()[]{}|;:,.<>?'");
    });
  });

  describe("configuration structure validation", () => {
    it("should always include required model fields", () => {
      const result = generator.generateBuilderConfig(baseItemType, "model");

      expect(result).toContain("name:");
      expect(result).toContain("config,");
      expect(result).toContain("body:");
      expect(result).toContain("api_key:");
      expect(result).toContain("singleton:");
      expect(result).toContain("sortable:");
      expect(result).toContain("draft_mode_active:");
      expect(result).toContain("all_locales_required:");
    });

    it("should always include required block fields", () => {
      const result = generator.generateBuilderConfig(baseItemType, "block");

      expect(result).toContain("name:");
      expect(result).toContain("config,");
      expect(result).toContain("options:");
      expect(result).toContain("api_key:");
      expect(result).toContain("hint:");
    });

    it("should not include model-specific fields in block config", () => {
      const result = generator.generateBuilderConfig(baseItemType, "block");

      expect(result).not.toContain("singleton:");
      expect(result).not.toContain("sortable:");
      expect(result).not.toContain("draft_mode_active:");
      expect(result).not.toContain("all_locales_required:");
      expect(result).not.toContain("body:");
    });

    it("should not include block-specific fields in model config", () => {
      const result = generator.generateBuilderConfig(baseItemType, "model");

      expect(result).not.toContain("hint:");
      expect(result).not.toContain("options:");
    });

    it("should maintain proper JavaScript object syntax", () => {
      const modelResult = generator.generateBuilderConfig(
        baseItemType,
        "model",
      );
      const blockResult = generator.generateBuilderConfig(
        baseItemType,
        "block",
      );

      // Should start and end with braces
      expect(modelResult.trim()).toMatch(/^{[\s\S]*}$/);
      expect(blockResult.trim()).toMatch(/^{[\s\S]*}$/);

      // Should have proper comma usage
      expect(modelResult).toContain("name: 'Test Item Type',");
      expect(modelResult).toContain("config,");
      expect(blockResult).toContain("name: 'Test Item Type',");
      expect(blockResult).toContain("config,");
    });
  });

  describe("edge cases", () => {
    it("should handle extremely long names", () => {
      const longName = "A".repeat(1000);
      const itemTypeWithLongName: ItemType = {
        ...baseItemType,
        name: longName,
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithLongName,
        "block",
      );

      expect(result).toContain(`name: '${longName}'`);
    });

    it("should handle extremely long api_keys", () => {
      const longApiKey = "a".repeat(1000);
      const itemTypeWithLongApiKey: ItemType = {
        ...baseItemType,
        api_key: longApiKey,
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithLongApiKey,
        "model",
      );

      expect(result).toContain(`api_key: '${longApiKey}'`);
    });

    it("should handle extremely long hints", () => {
      const longHint = "This is a very long hint. ".repeat(100);
      const itemTypeWithLongHint: ItemType = {
        ...baseItemType,
        hint: longHint,
      };

      const result = generator.generateBuilderConfig(
        itemTypeWithLongHint,
        "block",
      );

      expect(result).toContain(`hint: '${longHint}'`);
    });

    it("should handle empty strings", () => {
      const itemTypeWithEmptyStrings: ItemType = {
        ...baseItemType,
        name: "",
        api_key: "",
        hint: "",
      };

      const modelResult = generator.generateBuilderConfig(
        itemTypeWithEmptyStrings,
        "model",
      );
      const blockResult = generator.generateBuilderConfig(
        itemTypeWithEmptyStrings,
        "block",
      );

      expect(modelResult).toContain("name: ''");
      expect(modelResult).toContain("api_key: ''");
      expect(blockResult).toContain("name: ''");
      expect(blockResult).toContain("api_key: ''");
      expect(blockResult).toContain("hint: ''");
    });
  });
});
