import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import { StringCheckboxGroupFieldGenerator } from "./StringCheckboxGroupFieldGenerator";

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
    appearance: { addons: [], editor: "string_checkbox_group", parameters: {} },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("StringCheckboxGroupFieldGenerator", () => {
  describe("getMethodCallName", () => {
    it("should return addStringCheckboxGroup", () => {
      const field = createMockField({
        api_key: "checkbox_field",
        label: "Checkbox Group",
      });

      const generator = new StringCheckboxGroupFieldGenerator({ field });
      expect(generator.getMethodCallName()).toBe("addStringCheckboxGroup");
    });
  });

  describe("generateBuildConfig", () => {
    it("should generate basic StringCheckboxGroup config with options", () => {
      const field = createMockField({
        api_key: "checkbox_field",
        label: "Checkbox Group",
        appearance: {
          editor: "string_checkbox_group",
          parameters: {
            options: [
              { label: "Feature A", value: "feature_a" },
              { label: "Feature B", value: "feature_b" },
            ],
          },
          addons: [],
        },
      });

      const generator = new StringCheckboxGroupFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Checkbox Group",
        options: [
          { label: "Feature A", value: "feature_a" },
          { label: "Feature B", value: "feature_b" },
        ],
      });
    });

    it("should handle options with hints", () => {
      const field = createMockField({
        api_key: "checkbox_field",
        label: "Checkbox Group",
        appearance: {
          editor: "string_checkbox_group",
          parameters: {
            options: [
              {
                label: "Admin",
                value: "admin",
                hint: "Administrator privileges",
              },
              { label: "Editor", value: "editor" },
            ],
          },
          addons: [],
        },
      });

      const generator = new StringCheckboxGroupFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Checkbox Group",
        options: [
          { label: "Admin", value: "admin", hint: "Administrator privileges" },
          { label: "Editor", value: "editor" },
        ],
      });
    });

    it("should include body with validators for required field", () => {
      const field = createMockField({
        api_key: "required_checkbox",
        label: "Required Checkbox Group",
        appearance: {
          editor: "string_checkbox_group",
          parameters: {
            options: [{ label: "Option 1", value: "option1" }],
          },
          addons: [],
        },
        validators: {
          required: {},
        },
      });

      const generator = new StringCheckboxGroupFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Required Checkbox Group",
        options: [{ label: "Option 1", value: "option1" }],
        body: {
          api_key: "required_checkbox",
          validators: {
            required: true,
          },
        },
      });
    });

    it("should handle empty or missing options", () => {
      const field = createMockField({
        api_key: "checkbox_field",
        label: "Checkbox Group",
        appearance: {
          editor: "string_checkbox_group",
          parameters: {},
          addons: [],
        },
      });

      const generator = new StringCheckboxGroupFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Checkbox Group",
        options: [],
      });
    });

    it("should include hint and default value in body", () => {
      const field = createMockField({
        api_key: "checkbox_field",
        label: "Checkbox Group",
        hint: "Select multiple features",
        default_value: ["feature_a"] as any,
        appearance: {
          editor: "string_checkbox_group",
          parameters: {
            options: [{ label: "Feature A", value: "feature_a" }],
          },
          addons: [],
        },
      });

      const generator = new StringCheckboxGroupFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Checkbox Group",
        options: [{ label: "Feature A", value: "feature_a" }],
        body: {
          api_key: "checkbox_field",
          hint: "Select multiple features",
          default_value: ["feature_a"] as any,
        },
      });
    });
  });

  describe("generateMethodCall", () => {
    it("should generate correct method call for StringCheckboxGroup", () => {
      const field = createMockField({
        api_key: "checkbox_field",
        label: "Checkbox Group",
        appearance: {
          editor: "string_checkbox_group",
          parameters: {
            options: [
              { label: "Feature A", value: "feature_a" },
              { label: "Feature B", value: "feature_b" },
            ],
          },
          addons: [],
        },
      });

      const generator = new StringCheckboxGroupFieldGenerator({ field });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toBe(
        `.addStringCheckboxGroup({ label: "Checkbox Group", options: [{ label: "Feature A", value: "feature_a" }, { label: "Feature B", value: "feature_b" }] })`,
      );
    });

    it("should generate correct method call with body for required field", () => {
      const field = createMockField({
        api_key: "required_checkbox",
        label: "Required Checkbox Group",
        appearance: {
          editor: "string_checkbox_group",
          parameters: {
            options: [{ label: "Feature A", value: "feature_a" }],
          },
          addons: [],
        },
        validators: {
          required: {},
        },
      });

      const generator = new StringCheckboxGroupFieldGenerator({ field });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toBe(
        `.addStringCheckboxGroup({ label: "Required Checkbox Group", options: [{ label: "Feature A", value: "feature_a" }], body: { api_key: "required_checkbox", validators: { required: true } } })`,
      );
    });
  });
});
