import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import { JsonFieldGenerator } from "./JsonFieldGenerator";

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
    appearance: { addons: [], editor: "json", parameters: {} },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("JsonFieldGenerator", () => {
  describe("getMethodCallName", () => {
    it("should return addJson for no editor", () => {
      const field = createMockField({
        api_key: "json_field",
        label: "JSON Field",
      });

      const generator = new JsonFieldGenerator({ field });
      expect(generator.getMethodCallName()).toBe("addJson");
    });

    it("should return addJson for unknown editor", () => {
      const field = createMockField({
        api_key: "json_field",
        label: "JSON Field",
        appearance: {
          editor: "unknown_editor",
          parameters: {},
          addons: [],
        },
      });

      const generator = new JsonFieldGenerator({ field });
      expect(generator.getMethodCallName()).toBe("addJson");
    });
  });

  describe("generateBuildConfig", () => {
    it("should generate basic JSON config", () => {
      const field = createMockField({
        api_key: "json_field",
        label: "JSON Field",
      });

      const generator = new JsonFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "JSON Field",
      });
    });

    it("should include body with validators when required", () => {
      const field = createMockField({
        api_key: "required_json",
        label: "Required JSON",
        validators: {
          required: {},
        },
      });

      const generator = new JsonFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "Required JSON",
        body: {
          api_key: "required_json",
          validators: {
            required: true,
          },
        },
      });
    });

    it("should include hint and default value in body", () => {
      const field = createMockField({
        api_key: "json_field",
        label: "JSON Field",
        hint: "Store JSON data",
        default_value: { key: "value" },
      });

      const generator = new JsonFieldGenerator({ field });
      const config = generator.generateBuildConfig();

      expect(config).toEqual({
        label: "JSON Field",
        body: {
          api_key: "json_field",
          hint: "Store JSON data",
          default_value: { key: "value" },
        },
      });
    });
  });

  describe("generateMethodCall", () => {
    it("should generate correct method call for JSON field", () => {
      const field = createMockField({
        api_key: "json_field",
        label: "JSON Field",
        hint: "Store JSON data",
      });

      const generator = new JsonFieldGenerator({ field });
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toBe(
        `.addJson({ label: "JSON Field", body: { api_key: "json_field", hint: "Store JSON data" } })`,
      );
    });
  });
});
