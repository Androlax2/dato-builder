import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { BlockReferenceAnalyzer } from "@/FileGeneration/FileGenerators/BlockReferenceAnalyzer";

function createMockItemType(
  name: string,
  modular_block: boolean = false,
): ItemType {
  return {
    id: `test-${name.toLowerCase()}-id`,
    type: "item_type",
    name,
    api_key: name.toLowerCase().replace(/\s+/g, "_"),
    collection_appearance: "table",
    singleton: false,
    all_locales_required: true,
    sortable: false,
    modular_block,
    draft_mode_active: false,
    draft_saving_active: false,
    tree: false,
    ordering_direction: null,
    ordering_meta: null,
    has_singleton_item: false,
    hint: null,
    inverse_relationships_enabled: false,
    singleton_item: null,
    fields: [],
    fieldsets: [],
    presentation_title_field: null,
    presentation_image_field: null,
    title_field: null,
    image_preview_field: null,
    excerpt_field: null,
    ordering_field: null,
    workflow: null,
    meta: { has_singleton_item: false },
  } as ItemType;
}

describe("BlockReferenceAnalyzer", () => {
  let analyzer: BlockReferenceAnalyzer;
  let baseField: Field;

  beforeEach(() => {
    analyzer = new BlockReferenceAnalyzer();

    baseField = {
      id: "test-field-id",
      type: "field",
      field_type: "string",
      label: "Test Field",
      api_key: "test_field",
      hint: "",
      localized: false,
      validators: {},
      position: 1,
      appearance: { addons: [], editor: "single_line", parameters: {} },
      default_value: null,
      deep_filtering_enabled: false,
      item_type: { id: "item-type-id", type: "item_type" },
      fieldset: null,
    };
  });

  describe("hasBlockReferences", () => {
    it("should return false for empty fields array", () => {
      const result = analyzer.hasBlockReferences([]);
      expect(result).toBe(false);
    });

    it("should return false for fields without block references", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "string",
          validators: {},
        },
        {
          ...baseField,
          id: "date-field",
          field_type: "date",
          validators: {},
        },
        {
          ...baseField,
          id: "integer-field",
          field_type: "integer",
          validators: {},
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(false);
    });

    it("should return true for rich_text field with block references", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "rich_text",
          validators: {
            rich_text_blocks: {
              item_types: ["block-1", "block-2"],
            },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(true);
    });

    it("should return true for single_block field with block references", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "single_block",
          validators: {
            single_block: {
              item_types: ["block-1"],
            },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(true);
    });

    it("should return true for structured_text field with block references", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "structured_text",
          validators: {
            structured_text_blocks: {
              item_types: ["block-1", "block-2", "block-3"],
            },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(true);
    });

    it("should return false for rich_text field without item_types", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "rich_text",
          validators: {
            rich_text_blocks: {},
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(false);
    });

    it("should return false for rich_text field with empty item_types array", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "rich_text",
          validators: {
            rich_text_blocks: {
              item_types: [],
            },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(false);
    });

    it("should return true if any field has block references", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "string",
          validators: {},
        },
        {
          ...baseField,
          id: "rich-text-field",
          field_type: "rich_text",
          validators: {
            rich_text_blocks: {
              item_types: ["block-1"],
            },
          },
        },
        {
          ...baseField,
          id: "date-field",
          field_type: "date",
          validators: {},
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(true);
    });

    it("should handle multiple fields with different block reference types", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "rich_text",
          validators: {
            rich_text_blocks: {
              item_types: ["rich-block-1"],
            },
          },
        },
        {
          ...baseField,
          id: "single-block-field",
          field_type: "single_block",
          validators: {
            single_block: {
              item_types: ["single-block-1"],
            },
          },
        },
        {
          ...baseField,
          id: "structured-text-field",
          field_type: "structured_text",
          validators: {
            structured_text_blocks: {
              item_types: ["structured-block-1"],
            },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(true);
    });
  });

  describe("fieldReferencesOtherItems", () => {
    it("should return false for non-block field types", () => {
      const field: Field = {
        ...baseField,
        field_type: "string",
        validators: {},
      };

      // Access private method through any for testing
      const result = (analyzer as any).fieldReferencesOtherItems(field);
      expect(result).toBe(false);
    });

    it("should return false for block field types without validators", () => {
      const field: Field = {
        ...baseField,
        field_type: "rich_text",
        validators: {},
      };

      const result = (analyzer as any).fieldReferencesOtherItems(field);
      expect(result).toBe(false);
    });

    it("should return true for rich_text with item_types", () => {
      const field: Field = {
        ...baseField,
        field_type: "rich_text",
        validators: {
          rich_text_blocks: {
            item_types: ["block-1"],
          },
        },
      };

      const result = (analyzer as any).fieldReferencesOtherItems(field);
      expect(result).toBe(true);
    });
  });

  describe("getReferencedItemIds", () => {
    it("should return empty array for field without validators", () => {
      const field: Field = {
        ...baseField,
        validators: {},
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual([]);
    });

    it("should extract item_types from rich_text_blocks validator", () => {
      const field: Field = {
        ...baseField,
        validators: {
          rich_text_blocks: {
            item_types: ["block-1", "block-2"],
          },
        },
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual(["block-1", "block-2"]);
    });

    it("should extract item_types from single_block validator", () => {
      const field: Field = {
        ...baseField,
        validators: {
          single_block: {
            item_types: ["single-block-1"],
          },
        },
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual(["single-block-1"]);
    });

    it("should extract item_types from structured_text_blocks validator", () => {
      const field: Field = {
        ...baseField,
        validators: {
          structured_text_blocks: {
            item_types: ["structured-1", "structured-2", "structured-3"],
          },
        },
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual(["structured-1", "structured-2", "structured-3"]);
    });

    it("should combine item_types from multiple validators", () => {
      const field: Field = {
        ...baseField,
        validators: {
          rich_text_blocks: {
            item_types: ["rich-1", "rich-2"],
          },
          single_block: {
            item_types: ["single-1"],
          },
          structured_text_blocks: {
            item_types: ["structured-1"],
          },
        },
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual(["rich-1", "rich-2", "single-1", "structured-1"]);
    });

    it("should handle missing item_types in validators", () => {
      const field: Field = {
        ...baseField,
        validators: {
          rich_text_blocks: {},
          single_block: {
            item_types: ["single-1"],
          },
          structured_text_blocks: {},
        },
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual(["single-1"]);
    });

    it("should handle null/undefined validators", () => {
      const field: Field = {
        ...baseField,
        validators: {
          rich_text_blocks: null,
          single_block: undefined,
        } as any,
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual([]);
    });

    it("should handle invalid validator structure", () => {
      const field: Field = {
        ...baseField,
        validators: {
          rich_text_blocks: "invalid",
          single_block: 123,
        } as any,
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle malformed validators gracefully", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "rich_text",
          validators: null as any,
        },
        {
          ...baseField,
          id: "malformed-field",
          field_type: "single_block",
          validators: "invalid" as any,
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(false);
    });

    it("should handle undefined validators", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "structured_text",
          validators: undefined as any,
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(false);
    });

    it("should handle very large item_types arrays", () => {
      const largeItemTypes = Array.from(
        { length: 1000 },
        (_, i) => `block-${i}`,
      );
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "rich_text",
          validators: {
            rich_text_blocks: {
              item_types: largeItemTypes,
            },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(true);
    });
  });

  describe("link field support", () => {
    it("should detect link fields with item_item_type validator", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "link",
          validators: {
            item_item_type: {
              item_types: ["model-1"],
            },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(true);
    });

    it("should detect links fields with items_item_type validator", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "links",
          validators: {
            items_item_type: {
              item_types: ["model-1", "model-2"],
            },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(true);
    });

    it("should return false for link fields without item validators", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "link",
          validators: {
            required: {},
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(false);
    });

    it("should return false for links fields without item validators", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "links",
          validators: {
            size: { min: 1, max: 5 },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(false);
    });

    it("should extract item_types from item_item_type validator", () => {
      const field: Field = {
        ...baseField,
        field_type: "link",
        validators: {
          item_item_type: {
            item_types: ["model-1", "model-2"],
          },
        },
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual(["model-1", "model-2"]);
    });

    it("should extract item_types from items_item_type validator", () => {
      const field: Field = {
        ...baseField,
        field_type: "links",
        validators: {
          items_item_type: {
            item_types: ["block-1", "block-2", "model-1"],
          },
        },
      };

      const result = (analyzer as any).getReferencedItemIds(field);
      expect(result).toEqual(["block-1", "block-2", "model-1"]);
    });

    it("should handle mixed field types with link fields", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "string",
          validators: {},
        },
        {
          ...baseField,
          id: "link-field",
          field_type: "link",
          validators: {
            item_item_type: {
              item_types: ["model-1"],
            },
          },
        },
        {
          ...baseField,
          id: "links-field",
          field_type: "links",
          validators: {
            items_item_type: {
              item_types: ["block-1", "block-2"],
            },
          },
        },
        {
          ...baseField,
          id: "rich-text-field",
          field_type: "rich_text",
          validators: {
            rich_text_blocks: {
              item_types: ["rich-block-1"],
            },
          },
        },
      ];

      const result = analyzer.hasBlockReferences(fields);
      expect(result).toBe(true);
    });
  });

  describe("getUsedFunctions", () => {
    it("should return needsGetModel true for model references", () => {
      const itemTypeReferences = new Map([
        ["model-1", createMockItemType("Test Model")],
      ]);

      const fields: Field[] = [
        {
          ...baseField,
          field_type: "link",
          validators: {
            item_item_type: {
              item_types: ["model-1"],
            },
          },
        },
      ];

      const result = analyzer.getUsedFunctions(fields, itemTypeReferences);
      expect(result.needsGetModel).toBe(true);
      expect(result.needsGetBlock).toBe(false);
    });

    it("should return needsGetBlock true for block references", () => {
      const itemTypeReferences = new Map([
        ["block-1", createMockItemType("Test Block", true)],
      ]);

      const fields: Field[] = [
        {
          ...baseField,
          field_type: "links",
          validators: {
            items_item_type: {
              item_types: ["block-1"],
            },
          },
        },
      ];

      const result = analyzer.getUsedFunctions(fields, itemTypeReferences);
      expect(result.needsGetModel).toBe(false);
      expect(result.needsGetBlock).toBe(true);
    });

    it("should return both true for mixed references", () => {
      const itemTypeReferences = new Map([
        ["model-1", createMockItemType("Test Model")],
        ["block-1", createMockItemType("Test Block", true)],
      ]);

      const fields: Field[] = [
        {
          ...baseField,
          field_type: "links",
          validators: {
            items_item_type: {
              item_types: ["model-1", "block-1"],
            },
          },
        },
      ];

      const result = analyzer.getUsedFunctions(fields, itemTypeReferences);
      expect(result.needsGetModel).toBe(true);
      expect(result.needsGetBlock).toBe(true);
    });

    it("should return both true when no itemTypeReferences provided but has references", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "link",
          validators: {
            item_item_type: {
              item_types: ["some-id"],
            },
          },
        },
      ];

      const result = analyzer.getUsedFunctions(fields);
      expect(result.needsGetModel).toBe(true);
      expect(result.needsGetBlock).toBe(true);
    });

    it("should return both false when no references", () => {
      const fields: Field[] = [
        {
          ...baseField,
          field_type: "string",
          validators: {},
        },
      ];

      const result = analyzer.getUsedFunctions(fields);
      expect(result.needsGetModel).toBe(false);
      expect(result.needsGetBlock).toBe(false);
    });
  });
});
