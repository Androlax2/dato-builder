import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { BooleanConfig } from "@/Fields/Boolean";
import { BooleanFieldGenerator } from "@/FileGeneration/FieldGenerators/BooleanFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "boolean",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: undefined as any,
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("BooleanFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a boolean field with label", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Is Active",
          api_key: "is_active",
        }),
      });

      expect(booleanGenerator.generateBuildConfig()).toEqual({
        label: "Is Active",
        body: {
          api_key: "is_active",
        },
      } satisfies BooleanConfig);
    });

    it("returns correct method call name", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(booleanGenerator.getMethodCallName()).toBe("addBoolean");
    });

    it("includes hint when present", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Boolean with Hint",
          api_key: "boolean_with_hint",
          hint: "This is a hint",
        }),
      });

      const config = booleanGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a hint");
    });

    it("includes default_value when present", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Boolean with Default",
          api_key: "boolean_with_default",
          default_value: true,
        }),
      });

      const config = booleanGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe(true);
    });

    it("handles false default value", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Boolean False Default",
          api_key: "boolean_false_default",
          default_value: false,
        }),
      });

      const config = booleanGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe(false);
    });

    it("handles minimal configuration", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Minimal Boolean",
          api_key: "minimal_boolean",
        }),
      });

      const config = booleanGenerator.generateBuildConfig();
      expect(config).toEqual({
        label: "Minimal Boolean",
        body: {
          api_key: "minimal_boolean",
        },
      });
    });

    it("handles field with empty appearance", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Empty Appearance",
          api_key: "empty_appearance",
          appearance: { addons: [], editor: "checkbox", parameters: {} } as any,
        }),
      });

      const config = booleanGenerator.generateBuildConfig();
      expect(config.label).toBe("Empty Appearance");
      expect(config.body?.api_key).toBe("empty_appearance");
    });
  });

  describe("Method call generation", () => {
    it("generates correct method call string", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Test Boolean",
          api_key: "test_boolean",
          hint: "Test hint",
        }),
      });

      const methodCall = booleanGenerator.generateMethodCall();
      expect(methodCall).toContain(".addBoolean(");
      expect(methodCall).toContain('label: "Test Boolean"');
      expect(methodCall).toContain('api_key: "test_boolean"');
      expect(methodCall).toContain('hint: "Test hint"');
    });

    it("generates minimal method call", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Simple",
          api_key: "simple",
        }),
      });

      const methodCall = booleanGenerator.generateMethodCall();
      expect(methodCall).toContain(".addBoolean(");
      expect(methodCall).toContain('label: "Simple"');
      expect(methodCall).toContain('api_key: "simple"');
      expect(methodCall).not.toContain("hint");
      expect(methodCall).not.toContain("validators");
    });

    it("generates method call with default value", () => {
      const booleanGenerator = new BooleanFieldGenerator({
        field: createMockField({
          label: "Default Boolean",
          api_key: "default_boolean",
          default_value: true,
        }),
      });

      const methodCall = booleanGenerator.generateMethodCall();
      expect(methodCall).toContain("default_value: true");
    });
  });
});
