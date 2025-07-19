import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { StringSelectFieldGenerator } from "@/FileGeneration/FieldGenerators/StringSelectFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "string",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: undefined as any,
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "test-item-type", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("StringSelectFieldGenerator", () => {
  let stringSelectGenerator: StringSelectFieldGenerator;

  beforeEach(() => {
    stringSelectGenerator = new StringSelectFieldGenerator({
      field: createMockField({
        label: "Test String Select",
        api_key: "test_string_select",
      }),
    });
  });

  describe("getMethodCallName", () => {
    it("returns correct method call name", () => {
      expect(stringSelectGenerator.getMethodCallName()).toBe("addStringSelect");
    });
  });

  describe("generateBuildConfig", () => {
    it("generates basic config with empty options when no parameters", () => {
      const config = stringSelectGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Test String Select",
        options: [],
        body: {
          api_key: "test_string_select",
        },
      });
    });

    it("includes hint when present", () => {
      const stringSelectGenerator = new StringSelectFieldGenerator({
        field: createMockField({
          label: "Select with Hint",
          api_key: "select_with_hint",
          hint: "This is a field hint",
        }),
      });

      const config = stringSelectGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a field hint");
    });

    it("extracts options from appearance parameters", () => {
      const stringSelectGenerator = new StringSelectFieldGenerator({
        field: createMockField({
          label: "Select with Options",
          api_key: "select_with_options",
          appearance: {
            addons: [],
            editor: "string_select",
            parameters: {
              options: [
                { label: "Choice 1", value: "choice1" },
                { label: "Choice 2", value: "choice2", hint: "Second choice" },
              ],
            },
          } as any,
        }),
      });

      const config = stringSelectGenerator.generateBuildConfig();
      expect(config.options).toEqual([
        { label: "Choice 1", value: "choice1" },
        { label: "Choice 2", value: "choice2", hint: "Second choice" },
      ]);
    });

    it("handles options with all properties", () => {
      const stringSelectGenerator = new StringSelectFieldGenerator({
        field: createMockField({
          label: "Full Select",
          api_key: "full_select",
          appearance: {
            addons: [],
            editor: "string_select",
            parameters: {
              options: [
                { label: "Small", value: "sm", hint: "Small size" },
                { label: "Medium", value: "md", hint: "Medium size" },
                { label: "Large", value: "lg" },
              ],
            },
          } as any,
        }),
      });

      const config = stringSelectGenerator.generateBuildConfig();
      expect(config.options).toEqual([
        { label: "Small", value: "sm", hint: "Small size" },
        { label: "Medium", value: "md", hint: "Medium size" },
        { label: "Large", value: "lg" },
      ]);
    });

    it("includes default value when present", () => {
      const stringSelectGenerator = new StringSelectFieldGenerator({
        field: createMockField({
          label: "Select with Default",
          api_key: "select_with_default",
          default_value: "choice1",
        }),
      });

      const config = stringSelectGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe("choice1");
    });

    it("includes validators when present", () => {
      const stringSelectGenerator = new StringSelectFieldGenerator({
        field: createMockField({
          label: "Required Select",
          api_key: "required_select",
          validators: {
            required: true,
          } as any,
        }),
      });

      const config = stringSelectGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
    });
  });

  describe("generateMethodCall", () => {
    it("generates basic method call", () => {
      const methodCall = stringSelectGenerator.generateMethodCall();
      expect(methodCall).toContain(".addStringSelect(");
      expect(methodCall).toContain('label: "Test String Select"');
      expect(methodCall).toContain("options: []");
    });

    it("generates method call with options", () => {
      const stringSelectGenerator = new StringSelectFieldGenerator({
        field: createMockField({
          label: "Select with Options",
          api_key: "select_with_options",
          appearance: {
            addons: [],
            editor: "string_select",
            parameters: {
              options: [
                { label: "Option A", value: "a" },
                { label: "Option B", value: "b", hint: "Second option" },
              ],
            },
          } as any,
        }),
      });

      const methodCall = stringSelectGenerator.generateMethodCall();
      expect(methodCall).toContain(".addStringSelect(");
      expect(methodCall).toContain('label: "Select with Options"');
      expect(methodCall).toContain("options:");
      expect(methodCall).toContain('label: "Option A"');
      expect(methodCall).toContain('value: "a"');
      expect(methodCall).toContain('label: "Option B"');
      expect(methodCall).toContain('value: "b"');
      expect(methodCall).toContain('hint: "Second option"');
    });

    it("generates method call with body properties", () => {
      const stringSelectGenerator = new StringSelectFieldGenerator({
        field: createMockField({
          label: "Complex Select",
          api_key: "complex_select",
          hint: "Choose one option",
          default_value: "option1",
          validators: {
            required: true,
          } as any,
        }),
      });

      const methodCall = stringSelectGenerator.generateMethodCall();
      expect(methodCall).toContain(".addStringSelect(");
      expect(methodCall).toContain('label: "Complex Select"');
      expect(methodCall).toContain('api_key: "complex_select"');
      expect(methodCall).toContain('hint: "Choose one option"');
      expect(methodCall).toContain('default_value: "option1"');
      expect(methodCall).toContain("required: true");
    });
  });
});
