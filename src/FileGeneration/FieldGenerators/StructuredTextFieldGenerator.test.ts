import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { StructuredTextFieldGenerator } from "./StructuredTextFieldGenerator";

describe("StructuredTextFieldGenerator", () => {
  let generator: StructuredTextFieldGenerator;
  let itemTypeReferences: Map<string, ItemType>;

  beforeEach(() => {
    itemTypeReferences = new Map([
      [
        "block-id-1",
        {
          id: "block-id-1",
          name: "TestBlock",
          modular_block: true,
        } as ItemType,
      ],
      [
        "model-id-1",
        {
          id: "model-id-1",
          name: "Terminal",
          modular_block: false,
        } as ItemType,
      ],
      [
        "model-id-2",
        {
          id: "model-id-2",
          name: "Airline",
          modular_block: false,
        } as ItemType,
      ],
    ]);
  });

  describe("getMethodCallName", () => {
    it("should return addStructuredText", () => {
      const field = createStructuredTextField();
      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      expect(generator.getMethodCallName()).toBe("addStructuredText");
    });
  });

  describe("generateBuildConfig", () => {
    it("should generate basic structured text field configuration", () => {
      const field = createStructuredTextField({
        api_key: "test_structured_text",
        label: "Test Structured Text",
        hint: "Enter structured text content",
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(config.label).toBe("Test Structured Text");
    });

    it("should handle appearance parameters", () => {
      const field = createStructuredTextField({
        appearance: {
          editor: "structured_text",
          addons: [],
          parameters: {
            nodes: ["heading", "paragraph", "list"],
            marks: ["strong", "emphasis"],
            heading_levels: [1, 2, 3],
            blocks_start_collapsed: true,
            show_links_target_blank: false,
            show_links_meta_editor: true,
          },
        },
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(config.nodes).toEqual(["heading", "paragraph", "list"]);
      expect(config.marks).toEqual(["strong", "emphasis"]);
      expect(config.heading_levels).toEqual([1, 2, 3]);
      expect(config.blocks_start_collapsed).toBe(true);
      expect(config.show_links_target_blank).toBe(false);
      expect(config.show_links_meta_editor).toBe(true);
    });

    it("should handle structured_text_blocks validator with getBlock calls", () => {
      const field = createStructuredTextField({
        validators: {
          structured_text_blocks: {
            item_types: ["block-id-1"],
          },
        },
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(
        config.body?.validators?.structured_text_blocks?.item_types,
      ).toEqual([{ __async_call: 'await getBlock("TestBlock")' }]);
    });

    it("should handle structured_text_links validator with getModel calls", () => {
      const field = createStructuredTextField({
        validators: {
          structured_text_links: {
            item_types: ["model-id-1", "model-id-2"],
            on_publish_with_unpublished_references_strategy: "fail",
            on_reference_unpublish_strategy: "delete_references",
            on_reference_delete_strategy: "delete_references",
          },
        },
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(
        config.body?.validators?.structured_text_links?.item_types,
      ).toEqual([
        { __async_call: 'await getModel("Terminal")' },
        { __async_call: 'await getModel("Airline")' },
      ]);
      expect(
        config.body?.validators?.structured_text_links
          ?.on_publish_with_unpublished_references_strategy,
      ).toBe("fail");
      expect(
        config.body?.validators?.structured_text_links
          ?.on_reference_unpublish_strategy,
      ).toBe("delete_references");
      expect(
        config.body?.validators?.structured_text_links
          ?.on_reference_delete_strategy,
      ).toBe("delete_references");
    });

    it("should handle both blocks and links validators", () => {
      const field = createStructuredTextField({
        validators: {
          structured_text_blocks: {
            item_types: ["block-id-1"],
          },
          structured_text_links: {
            item_types: ["model-id-1"],
            on_publish_with_unpublished_references_strategy: "fail",
            on_reference_unpublish_strategy: "delete_references",
            on_reference_delete_strategy: "delete_references",
          },
        },
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(
        config.body?.validators?.structured_text_blocks?.item_types,
      ).toEqual([{ __async_call: 'await getBlock("TestBlock")' }]);
      expect(
        config.body?.validators?.structured_text_links?.item_types,
      ).toEqual([{ __async_call: 'await getModel("Terminal")' }]);
    });

    it("should handle length validator", () => {
      const field = createStructuredTextField({
        validators: {
          length: {
            min: 10,
            max: 500,
          },
        },
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.length).toEqual({
        min: 10,
        max: 500,
      });
    });

    it("should handle structured_text_inline_blocks validator", () => {
      const field = createStructuredTextField({
        validators: {
          structured_text_inline_blocks: {
            item_types: ["block-id-1"],
          },
        },
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.structured_text_inline_blocks).toEqual({
        item_types: ["block-id-1"],
      });
    });

    it("should combine multiple validators", () => {
      const field = createStructuredTextField({
        validators: {
          length: { min: 5 },
          structured_text_blocks: {
            item_types: ["block-id-1"],
          },
          structured_text_links: {
            item_types: ["model-id-1"],
            on_publish_with_unpublished_references_strategy: "fail",
            on_reference_unpublish_strategy: "delete_references",
            on_reference_delete_strategy: "delete_references",
          },
        },
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.length).toEqual({ min: 5 });
      expect(
        config.body?.validators?.structured_text_blocks?.item_types,
      ).toEqual([{ __async_call: 'await getBlock("TestBlock")' }]);
      expect(
        config.body?.validators?.structured_text_links?.item_types,
      ).toEqual([{ __async_call: 'await getModel("Terminal")' }]);
    });

    it("should handle default value", () => {
      const field = createStructuredTextField({
        default_value: "Default structured content",
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(config.body?.default_value).toBe("Default structured content");
    });

    it("should not include body if no content beyond api_key", () => {
      const field = createStructuredTextField({
        api_key: "simple_field",
        validators: {},
        hint: null,
        default_value: null,
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(config.body).toBeUndefined();
    });

    it("should include body if hint is present", () => {
      const field = createStructuredTextField({
        hint: "Enter some text",
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const config = generator.generateBuildConfig();

      expect(config.body?.hint).toBe("Enter some text");
    });
  });

  describe("generateMethodCall", () => {
    it("should generate proper method call string with all features", () => {
      const field = createStructuredTextField({
        api_key: "test_structured_text",
        label: "Test Structured Text",
        hint: "Enter rich content",
        appearance: {
          editor: "structured_text",
          addons: [],
          parameters: {
            nodes: ["heading", "paragraph"],
            marks: ["strong"],
            heading_levels: [1, 2],
            blocks_start_collapsed: false,
            show_links_target_blank: true,
            show_links_meta_editor: false,
          },
        },
        validators: {
          structured_text_blocks: {
            item_types: ["block-id-1"],
          },
          structured_text_links: {
            item_types: ["model-id-1"],
            on_publish_with_unpublished_references_strategy: "fail",
            on_reference_unpublish_strategy: "delete_references",
            on_reference_delete_strategy: "delete_references",
          },
        },
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain(".addStructuredText({");
      expect(methodCall).toContain('label: "Test Structured Text"');
      expect(methodCall).toContain('nodes: ["heading", "paragraph"]');
      expect(methodCall).toContain('marks: ["strong"]');
      expect(methodCall).toContain("heading_levels: [1, 2]");
      expect(methodCall).toContain("blocks_start_collapsed: false");
      expect(methodCall).toContain("show_links_target_blank: true");
      expect(methodCall).toContain("show_links_meta_editor: false");
      expect(methodCall).toContain('api_key: "test_structured_text"');
      expect(methodCall).toContain('hint: "Enter rich content"');
      expect(methodCall).toContain('await getBlock("TestBlock")');
      expect(methodCall).toContain('await getModel("Terminal")');
    });

    it("should generate minimal method call for simple field", () => {
      const field = createStructuredTextField({
        api_key: "simple_field",
        label: "Simple Field",
        validators: {},
        hint: null,
        default_value: null,
      });

      generator = new StructuredTextFieldGenerator({
        field,
        itemTypeReferences,
      });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain(".addStructuredText({");
      expect(methodCall).toContain('label: "Simple Field"');
      expect(methodCall).not.toContain("body:");
      expect(methodCall).not.toContain("validators:");
    });
  });

  function createStructuredTextField(overrides: Partial<Field> = {}): Field {
    return {
      id: "field-id",
      api_key: "structured_text_field",
      label: "Structured Text Field",
      field_type: "structured_text",
      localized: false,
      validators: {},
      appearance: {
        editor: "structured_text",
        addons: [],
        parameters: {},
      },
      default_value: null,
      hint: null,
      ...overrides,
    } as Field;
  }
});
