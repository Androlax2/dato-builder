import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import { LinkFieldGenerator } from "@/FileGeneration/FieldGenerators/LinkFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "link",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: { addons: [], editor: "link_select", parameters: {} },
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

describe("LinkFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a basic link field", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Related Model",
          api_key: "related_model",
        }),
      });

      const config = linkGenerator.generateBuildConfig();
      expect(config.label).toBe("Related Model");
      expect(config.appearance).toBe("compact");
      expect(config.body?.api_key).toBe("related_model");
      expect(config.body?.validators).toBeUndefined();
    });

    it("maps link_select editor to compact appearance", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Compact Link",
          api_key: "compact_link",
          appearance: { addons: [], editor: "link_select", parameters: {} },
        }),
      });

      const config = linkGenerator.generateBuildConfig();
      expect(config.appearance).toBe("compact");
    });

    it("maps link_embed editor to expanded appearance", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Expanded Link",
          api_key: "expanded_link",
          appearance: { addons: [], editor: "link_embed", parameters: {} },
        }),
      });

      const config = linkGenerator.generateBuildConfig();
      expect(config.appearance).toBe("expanded");
    });

    it("defaults to compact appearance for unknown editor", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Unknown Link",
          api_key: "unknown_link",
          appearance: { addons: [], editor: "unknown_editor", parameters: {} },
        }),
      });

      const config = linkGenerator.generateBuildConfig();
      expect(config.appearance).toBe("compact");
    });
  });

  describe("Validators", () => {
    it("handles item_item_type validator with getModel calls", () => {
      const itemTypeReferences = new Map<string, ItemType>([
        ["terminal-id", createMockItemType("Terminal")],
        ["airline-id", createMockItemType("Airline")],
      ]);

      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Model Link",
          api_key: "model_link",
          validators: {
            item_item_type: {
              item_types: ["terminal-id", "airline-id"],
            },
          },
        }),
        itemTypeReferences,
      });

      const methodCall = linkGenerator.generateMethodCall();
      expect(methodCall).toContain('await getModel("Terminal")');
      expect(methodCall).toContain('await getModel("Airline")');
    });

    it("handles item_item_type validator with getBlock calls", () => {
      const itemTypeReferences = new Map<string, ItemType>([
        ["block-id", createMockItemType("TestBlock", true)],
      ]);

      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Block Link",
          api_key: "block_link",
          validators: {
            item_item_type: {
              item_types: ["block-id"],
            },
          },
        }),
        itemTypeReferences,
      });

      const methodCall = linkGenerator.generateMethodCall();
      expect(methodCall).toContain('await getBlock("TestBlock")');
    });

    it("handles complex model names with PascalCase", () => {
      const itemTypeReferences = new Map<string, ItemType>([
        ["foobar-id", createMockItemType("Foo Bar")],
      ]);

      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Complex Name Link",
          api_key: "complex_name_link",
          validators: {
            item_item_type: {
              item_types: ["foobar-id"],
            },
          },
        }),
        itemTypeReferences,
      });

      const methodCall = linkGenerator.generateMethodCall();
      expect(methodCall).toContain('await getModel("FooBar")');
    });

    it("handles required validator", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Required Link",
          api_key: "required_link",
          validators: {
            required: {},
          },
        }),
      });

      const config = linkGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
    });

    it("handles unique validator", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Unique Link",
          api_key: "unique_link",
          validators: {
            unique: {},
          },
        }),
      });

      const config = linkGenerator.generateBuildConfig();
      expect(config.body?.validators?.unique).toEqual({});
    });

    it("includes hint when present", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Link with Hint",
          api_key: "link_with_hint",
          hint: "Select a related model",
        }),
      });

      const config = linkGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("Select a related model");
    });
  });

  describe("Error handling", () => {
    it("throws error when item type reference is missing", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Missing Reference",
          api_key: "missing_reference",
          validators: {
            item_item_type: {
              item_types: ["nonexistent-id"],
            },
          },
        }),
        itemTypeReferences: new Map(),
      });

      expect(() => linkGenerator.generateMethodCall()).toThrow(
        'Item type with ID "nonexistent-id" not found in references for field missing_reference',
      );
    });

    it("throws error when itemTypeReferences is not provided", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "No References",
          api_key: "no_references",
          validators: {
            item_item_type: {
              item_types: ["some-id"],
            },
          },
        }),
      });

      expect(() => linkGenerator.generateMethodCall()).toThrow(
        "Cannot resolve item type references for field no_references. Item type references not available.",
      );
    });
  });

  describe("Method call generation", () => {
    it("generates correct method call syntax", () => {
      const itemTypeReferences = new Map<string, ItemType>([
        ["terminal-id", createMockItemType("Terminal")],
      ]);

      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Test Link",
          api_key: "test_link",
          validators: {
            item_item_type: {
              item_types: ["terminal-id"],
            },
          },
        }),
        itemTypeReferences,
      });

      const methodCall = linkGenerator.generateMethodCall();
      expect(methodCall).toMatch(/^\.addLink\(/);
      expect(methodCall).toContain('"Test Link"');
      expect(methodCall).toContain('api_key: "test_link"');
      expect(methodCall).toContain('await getModel("Terminal")');
    });

    it("generates method call without validators when none present", () => {
      const linkGenerator = new LinkFieldGenerator({
        field: createMockField({
          label: "Simple Link",
          api_key: "simple_link",
        }),
      });

      const methodCall = linkGenerator.generateMethodCall();
      expect(methodCall).not.toContain("validators");
    });
  });
});
