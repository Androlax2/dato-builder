import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import { StringMultiSelectFieldGenerator } from "./StringMultiSelectFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "json",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: { addons: [], editor: "string_multi_select", parameters: {} },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("StringMultiSelectFieldGenerator", () => {
  describe("getMethodCallName", () => {
    it("should return addStringMultiSelect", () => {
      const field = createMockField({
        api_key: "multi_select_field",
        label: "Multi Select",
      });

      const generator = new StringMultiSelectFieldGenerator({ field });
      expect(generator.getMethodCallName()).toBe("addStringMultiSelect");
    });
  });

  describe("generateBuildConfig", () => {
    it("should generate basic StringMultiSelect config with options", () => {
      const field = createMockField({
        api_key: "multi_select_field",
        label: "Multi Select",
        appearance: {
          editor: "string_multi_select",
          parameters: {
            options: [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ],
          },
          addons: [],
        },
      });

      const generator = new StringMultiSelectFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Multi Select",
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
      });
    });

    it("should handle options with hints", () => {
      const field = createMockField({
        api_key: "multi_select_field",
        label: "Multi Select",
        appearance: {
          editor: "string_multi_select",
          parameters: {
            options: [
              { label: "Red", value: "red", hint: "The color red" },
              { label: "Blue", value: "blue" },
            ],
          },
          addons: [],
        },
      });

      const generator = new StringMultiSelectFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Multi Select",
        options: [
          { label: "Red", value: "red", hint: "The color red" },
          { label: "Blue", value: "blue" },
        ],
      });
    });

    it("should include body with validators for required field", () => {
      const field = createMockField({
        api_key: "required_multi_select",
        label: "Required Multi Select",
        appearance: {
          editor: "string_multi_select",
          parameters: {
            options: [{ label: "Option 1", value: "option1" }],
          },
          addons: [],
        },
        validators: {
          required: {},
        },
      });

      const generator = new StringMultiSelectFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Required Multi Select",
        options: [{ label: "Option 1", value: "option1" }],
        body: {
          api_key: "required_multi_select",
          validators: {
            required: true,
          },
        },
      });
    });

    it("should handle empty or missing options", () => {
      const field = createMockField({
        api_key: "multi_select_field",
        label: "Multi Select",
        appearance: {
          editor: "string_multi_select",
          parameters: {},
          addons: [],
        },
      });

      const generator = new StringMultiSelectFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Multi Select",
        options: [],
      });
    });

    it("should include hint and default value in body", () => {
      const field = createMockField({
        api_key: "multi_select_field",
        label: "Multi Select",
        hint: "Select multiple options",
        default_value: ["option1"] as any,
        appearance: {
          editor: "string_multi_select",
          parameters: {
            options: [{ label: "Option 1", value: "option1" }],
          },
          addons: [],
        },
      });

      const generator = new StringMultiSelectFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Multi Select",
        options: [{ label: "Option 1", value: "option1" }],
        body: {
          api_key: "multi_select_field",
          hint: "Select multiple options",
          default_value: ["option1"] as any,
        },
      });
    });
  });

  describe("generateMethodCall", () => {
    it("should generate correct method call for StringMultiSelect", () => {
      const field = createMockField({
        api_key: "multi_select_field",
        label: "Multi Select",
        appearance: {
          editor: "string_multi_select",
          parameters: {
            options: [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ],
          },
          addons: [],
        },
      });

      const generator = new StringMultiSelectFieldGenerator({ field });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toBe(
        `.addStringMultiSelect({ label: "Multi Select", options: [{ label: "Option 1", value: "option1" }, { label: "Option 2", value: "option2" }] })`,
      );
    });

    it("should generate correct method call with body for required field", () => {
      const field = createMockField({
        api_key: "required_multi_select",
        label: "Required Multi Select",
        appearance: {
          editor: "string_multi_select",
          parameters: {
            options: [{ label: "Option 1", value: "option1" }],
          },
          addons: [],
        },
        validators: {
          required: {},
        },
      });

      const generator = new StringMultiSelectFieldGenerator({ field });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toBe(
        `.addStringMultiSelect({ label: "Required Multi Select", options: [{ label: "Option 1", value: "option1" }], body: { api_key: "required_multi_select", validators: { required: true } } })`,
      );
    });
  });
});
