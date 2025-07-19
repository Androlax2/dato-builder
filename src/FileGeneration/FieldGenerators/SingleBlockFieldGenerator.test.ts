import type {
  Field,
  ItemType,
} from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { SingleBlockFieldGenerator } from "./SingleBlockFieldGenerator";

describe("SingleBlockFieldGenerator", () => {
  let generator: SingleBlockFieldGenerator;
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
    it("should return addSingleBlock", () => {
      const field = createSingleBlockField();
      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      expect(generator.getMethodCallName()).toBe("addSingleBlock");
    });
  });

  describe("generateBuildConfig", () => {
    it("should generate basic single block field configuration", () => {
      const field = createSingleBlockField({
        api_key: "test_single_block",
        label: "Test Single Block",
        hint: "Select a single block",
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.label).toBe("Test Single Block");
      expect(config.body?.api_key).toBe("test_single_block");
      expect(config.body?.hint).toBe("Select a single block");
    });

    it("should default to framed_single_block type", () => {
      const field = createSingleBlockField();

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.type).toBe("framed_single_block");
    });

    it("should set frameless_single_block type when editor is frameless", () => {
      const field = createSingleBlockField({
        appearance: {
          editor: "frameless_single_block",
          addons: [],
          parameters: {},
        },
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.type).toBe("frameless_single_block");
    });

    it("should handle start_collapsed parameter for framed type", () => {
      const field = createSingleBlockField({
        appearance: {
          editor: "single_block",
          addons: [],
          parameters: {
            start_collapsed: true,
          },
        },
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.type).toBe("framed_single_block");
      expect(config.start_collapsed).toBe(true);
    });

    it("should not include start_collapsed for frameless type", () => {
      const field = createSingleBlockField({
        appearance: {
          editor: "frameless_single_block",
          addons: [],
          parameters: {
            start_collapsed: true,
          },
        },
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.type).toBe("frameless_single_block");
      expect(config.start_collapsed).toBeUndefined();
    });

    it("should process single_block_blocks validator with getBlock calls", () => {
      const field = createSingleBlockField({
        validators: {
          single_block_blocks: {
            item_types: ["block-id-1"],
          },
        },
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.single_block_blocks?.item_types).toEqual([
        { __async_call: 'await getBlock("TestBlock")' },
      ]);
    });

    it("should handle multiple blocks in single_block_blocks validator", () => {
      itemTypeReferences.set("block-id-2", {
        id: "block-id-2",
        name: "AnotherBlock",
        modular_block: true,
      } as ItemType);

      const field = createSingleBlockField({
        validators: {
          single_block_blocks: {
            item_types: ["block-id-1", "block-id-2"],
          },
        },
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.single_block_blocks?.item_types).toEqual([
        { __async_call: 'await getBlock("TestBlock")' },
        { __async_call: 'await getBlock("AnotherBlock")' },
      ]);
    });

    it("should handle required validator", () => {
      const field = createSingleBlockField({
        validators: {
          required: true,
        },
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.required).toBe(true);
    });

    it("should combine validators", () => {
      const field = createSingleBlockField({
        validators: {
          single_block_blocks: {
            item_types: ["block-id-1"],
          },
          required: true,
        },
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.validators?.single_block_blocks?.item_types).toEqual([
        { __async_call: 'await getBlock("TestBlock")' },
      ]);
      expect(config.body?.validators?.required).toBe(true);
    });

    it("should handle default value", () => {
      const field = createSingleBlockField({
        default_value: "default_block_id",
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const config = generator.generateBuildConfig();

      expect(config.body?.default_value).toBe("default_block_id");
    });
  });

  describe("generateMethodCall", () => {
    it("should generate proper method call string for framed type", () => {
      const field = createSingleBlockField({
        api_key: "test_single_block",
        label: "Test Single Block",
        validators: {
          single_block_blocks: {
            item_types: ["block-id-1"],
          },
        },
        appearance: {
          editor: "single_block",
          addons: [],
          parameters: {
            start_collapsed: false,
          },
        },
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain(".addSingleBlock({");
      expect(methodCall).toContain('label: "Test Single Block"');
      expect(methodCall).toContain('type: "framed_single_block"');
      expect(methodCall).toContain("start_collapsed: false");
      expect(methodCall).toContain('api_key: "test_single_block"');
      expect(methodCall).toContain('await getBlock("TestBlock")');
    });

    it("should generate proper method call string for frameless type", () => {
      const field = createSingleBlockField({
        api_key: "test_frameless",
        label: "Test Frameless",
        appearance: {
          editor: "frameless_single_block",
          addons: [],
          parameters: {},
        },
        validators: {
          single_block_blocks: {
            item_types: ["block-id-1"],
          },
        },
      });

      generator = new SingleBlockFieldGenerator({ field, itemTypeReferences });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toContain(".addSingleBlock({");
      expect(methodCall).toContain('label: "Test Frameless"');
      expect(methodCall).toContain('type: "frameless_single_block"');
      expect(methodCall).not.toContain("start_collapsed");
      expect(methodCall).toContain('await getBlock("TestBlock")');
    });
  });

  function createSingleBlockField(overrides: Partial<Field> = {}): Field {
    return {
      id: "field-id",
      api_key: "single_block_field",
      label: "Single Block Field",
      field_type: "single_block",
      localized: false,
      validators: {},
      appearance: {
        editor: "single_block",
        addons: [],
        parameters: {},
      },
      default_value: null,
      hint: null,
      ...overrides,
    } as Field;
  }
});
