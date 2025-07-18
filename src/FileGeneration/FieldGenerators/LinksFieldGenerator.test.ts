import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import { LinksFieldGenerator } from "@/FileGeneration/FieldGenerators/LinksFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "links",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: { addons: [], editor: "links_select", parameters: {} },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

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

describe("LinksFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a basic links field", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Related Models",
          api_key: "related_models",
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      expect(config.label).toBe("Related Models");
      expect(config.appearance).toBe("compact");
      expect(config.body?.api_key).toBe("related_models");
      expect(config.body?.validators).toBeUndefined();
    });

    it("maps links_select editor to compact appearance", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Compact Links",
          api_key: "compact_links",
          appearance: { addons: [], editor: "links_select", parameters: {} },
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      expect(config.appearance).toBe("compact");
    });

    it("maps links_embed editor to expanded appearance", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Expanded Links",
          api_key: "expanded_links",
          appearance: { addons: [], editor: "links_embed", parameters: {} },
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      expect(config.appearance).toBe("expanded");
    });

    it("defaults to compact appearance for unknown editor", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Unknown Links",
          api_key: "unknown_links",
          appearance: { addons: [], editor: "unknown_editor", parameters: {} },
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      expect(config.appearance).toBe("compact");
    });
  });

  describe("Validators", () => {
    it("handles items_item_type validator with multiple getModel calls", () => {
      const itemTypeReferences = new Map<string, ItemType>([
        ["terminal-id", createMockItemType("Terminal")],
        ["airline-id", createMockItemType("Airline")],
        ["foobar-id", createMockItemType("Foo Bar")],
      ]);

      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Multiple Models",
          api_key: "multiple_models",
          validators: {
            items_item_type: {
              item_types: ["terminal-id", "airline-id", "foobar-id"],
            },
          },
        }),
        itemTypeReferences,
      });

      const methodCall = linksGenerator.generateMethodCall();
      expect(methodCall).toContain('await getModel("Terminal")');
      expect(methodCall).toContain('await getModel("Airline")');
      expect(methodCall).toContain('await getModel("FooBar")');
    });

    it("handles items_item_type validator with mixed blocks and models", () => {
      const itemTypeReferences = new Map<string, ItemType>([
        ["model-id", createMockItemType("TestModel")],
        ["block-id", createMockItemType("TestBlock", true)],
      ]);

      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Mixed Links",
          api_key: "mixed_links",
          validators: {
            items_item_type: {
              item_types: ["model-id", "block-id"],
            },
          },
        }),
        itemTypeReferences,
      });

      const methodCall = linksGenerator.generateMethodCall();
      expect(methodCall).toContain('await getModel("TestModel")');
      expect(methodCall).toContain('await getBlock("TestBlock")');
    });

    it("handles size validator with min and max", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Size Constrained",
          api_key: "size_constrained",
          validators: {
            size: {
              min: 2,
              max: 5,
            },
          },
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      expect(config.body?.validators?.size).toEqual({
        min: 2,
        max: 5,
      });
    });

    it("handles size validator with only min", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Min Size",
          api_key: "min_size",
          validators: {
            size: {
              min: 1,
            },
          },
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      expect(config.body?.validators?.size).toEqual({
        min: 1,
      });
    });

    it("handles size validator with only max", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Max Size",
          api_key: "max_size",
          validators: {
            size: {
              max: 10,
            },
          },
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      expect(config.body?.validators?.size).toEqual({
        max: 10,
      });
    });

    it("handles required validator", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Required Links",
          api_key: "required_links",
          validators: {
            required: {},
          },
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      // biome-ignore lint/suspicious/noExplicitAny: Type casting required for test assertions on dynamic validator structures
      expect((config.body?.validators as any)?.required).toBe(true);
    });

    it("handles unique validator", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Unique Links",
          api_key: "unique_links",
          validators: {
            unique: {},
          },
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      // biome-ignore lint/suspicious/noExplicitAny: Type casting required for test assertions on dynamic validator structures
      expect((config.body?.validators as any)?.unique).toBe(true);
    });

    it("includes hint when present", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Links with Hint",
          api_key: "links_with_hint",
          hint: "Select multiple related models",
        }),
      });

      const config = linksGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("Select multiple related models");
    });

    it("handles combined validators", () => {
      const itemTypeReferences = new Map<string, ItemType>([
        ["terminal-id", createMockItemType("Terminal")],
      ]);

      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Complex Links",
          api_key: "complex_links",
          validators: {
            items_item_type: {
              item_types: ["terminal-id"],
            },
            size: {
              min: 1,
              max: 3,
            },
            required: {},
            unique: {},
          },
        }),
        itemTypeReferences,
      });

      const config = linksGenerator.generateBuildConfig();
      expect(config.body?.validators?.items_item_type).toBeDefined();
      expect(config.body?.validators?.size).toEqual({ min: 1, max: 3 });
      // biome-ignore lint/suspicious/noExplicitAny: Type casting required for test assertions on dynamic validator structures
      expect((config.body?.validators as any)?.required).toBe(true);
      // biome-ignore lint/suspicious/noExplicitAny: Type casting required for test assertions on dynamic validator structures
      expect((config.body?.validators as any)?.unique).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("throws error when item type reference is missing", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Missing Reference",
          api_key: "missing_reference",
          validators: {
            items_item_type: {
              item_types: ["nonexistent-id"],
            },
          },
        }),
        itemTypeReferences: new Map(),
      });

      expect(() => linksGenerator.generateMethodCall()).toThrow(
        'Item type with ID "nonexistent-id" not found in references for field missing_reference',
      );
    });

    it("throws error when itemTypeReferences is not provided", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "No References",
          api_key: "no_references",
          validators: {
            items_item_type: {
              item_types: ["some-id"],
            },
          },
        }),
      });

      expect(() => linksGenerator.generateMethodCall()).toThrow(
        "Cannot resolve item type references for field no_references. Item type references not available.",
      );
    });
  });

  describe("Method call generation", () => {
    it("generates correct method call syntax", () => {
      const itemTypeReferences = new Map<string, ItemType>([
        ["terminal-id", createMockItemType("Terminal")],
        ["airline-id", createMockItemType("Airline")],
      ]);

      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Test Links",
          api_key: "test_links",
          validators: {
            items_item_type: {
              item_types: ["terminal-id", "airline-id"],
            },
            size: {
              min: 1,
              max: 5,
            },
          },
        }),
        itemTypeReferences,
      });

      const methodCall = linksGenerator.generateMethodCall();
      expect(methodCall).toMatch(/^\.addLinks\(/);
      expect(methodCall).toContain('"Test Links"');
      expect(methodCall).toContain('api_key: "test_links"');
      expect(methodCall).toContain('await getModel("Terminal")');
      expect(methodCall).toContain('await getModel("Airline")');
      expect(methodCall).toContain("min: 1");
      expect(methodCall).toContain("max: 5");
    });

    it("generates method call without validators when none present", () => {
      const linksGenerator = new LinksFieldGenerator({
        field: createMockField({
          label: "Simple Links",
          api_key: "simple_links",
        }),
      });

      const methodCall = linksGenerator.generateMethodCall();
      expect(methodCall).not.toContain("validators");
    });
  });
});
