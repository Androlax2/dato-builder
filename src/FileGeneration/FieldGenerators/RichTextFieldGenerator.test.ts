import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { RichTextFieldGenerator } from "./RichTextFieldGenerator";

describe("RichTextFieldGenerator", () => {
  let generator: RichTextFieldGenerator;
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
          name: "TestModel",
          modular_block: false,
        } as ItemType,
      ],
    ]);
  });

  describe("getMethodCallName", () => {
    it("should return addModularContent", () => {
      const field = createRichTextField();
      generator = new RichTextFieldGenerator({ field });
      expect(generator.getMethodCallName()).toBe("addModularContent");
    });
  });

  describe("generateBuildConfig", () => {
    it("should generate basic rich text field configuration", () => {
      const field = createRichTextField({
        api_key: "test_rich_text",
        label: "Test Rich Text",
        hint: "Enter rich text content",
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.label).toBe("Test Rich Text");
      expect(config.body?.api_key).toBe("test_rich_text");
      expect(config.body?.hint).toBe("Enter rich text content");
    });

    it("should handle start_collapsed parameter", () => {
      const field = createRichTextField({
        appearance: {
          editor: "rich_text",
          addons: [],
          parameters: {
            start_collapsed: true,
          },
        },
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.start_collapsed).toBe(true);
    });

    it("should handle start_collapsed false", () => {
      const field = createRichTextField({
        appearance: {
          editor: "rich_text",
          addons: [],
          parameters: {
            start_collapsed: false,
          },
        },
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.start_collapsed).toBe(false);
    });

    it("should process rich_text_blocks validator with getBlock calls", () => {
      const field = createRichTextField({
        validators: {
          rich_text_blocks: {
            item_types: ["block-id-1"],
          },
        },
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.rich_text_blocks?.item_types).toEqual([
        { __async_call: 'await getBlock("TestBlock")' },
      ]);
    });

    it("should process size validator", () => {
      const field = createRichTextField({
        validators: {
          size: {
            min: 1,
            max: 5,
          },
        },
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.size).toEqual({
        min: 1,
        max: 5,
      });
    });

    it("should handle multiple blocks in rich_text_blocks validator", () => {
      itemTypeReferences.set("block-id-2", {
        id: "block-id-2",
        name: "AnotherBlock",
        modular_block: true,
      } as ItemType);

      const field = createRichTextField({
        validators: {
          rich_text_blocks: {
            item_types: ["block-id-1", "block-id-2"],
          },
        },
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.rich_text_blocks?.item_types).toEqual([
        { __async_call: 'await getBlock("TestBlock")' },
        { __async_call: 'await getBlock("AnotherBlock")' },
      ]);
    });

    it("should handle required validator", () => {
      const field = createRichTextField({
        validators: {
          required: true,
        },
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.required).toBe(true);
    });

    it("should combine multiple validators", () => {
      const field = createRichTextField({
        validators: {
          rich_text_blocks: {
            item_types: ["block-id-1"],
          },
          size: {
            min: 2,
          },
          required: true,
        },
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.rich_text_blocks?.item_types).toEqual([
        { __async_call: 'await getBlock("TestBlock")' },
      ]);
      expect(config.body?.validators?.size).toEqual({ min: 2 });
      expect(config.body?.validators?.required).toBe(true);
    });

    it("should handle default value", () => {
      const field = createRichTextField({
        default_value: "Default content",
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.default_value).toBe("Default content");
    });
  });

  describe("generateMethodCall", () => {
    it("should generate proper method call string", () => {
      const field = createRichTextField({
        api_key: "test_rich_text",
        label: "Test Rich Text",
        validators: {
          rich_text_blocks: {
            item_types: ["block-id-1"],
          },
        },
        appearance: {
          editor: "rich_text",
          addons: [],
          parameters: {
            start_collapsed: false,
          },
        },
      });

      generator = new RichTextFieldGenerator({ field, itemTypeReferences });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain(".addModularContent({");
      expect(methodCall).toContain('label: "Test Rich Text"');
      expect(methodCall).toContain("start_collapsed: false");
      expect(methodCall).toContain('api_key: "test_rich_text"');
      expect(methodCall).toContain('await getBlock("TestBlock")');
    });
  });

  function createRichTextField(overrides: Partial<Field> = {}): Field {
    return {
      id: "field-id",
      api_key: "rich_text_field",
      label: "Rich Text Field",
      field_type: "rich_text",
      localized: false,
      validators: {},
      appearance: {
        editor: "rich_text",
        addons: [],
        parameters: {},
      },
      default_value: null,
      hint: null,
      ...overrides,
    } as Field;
  }
});
