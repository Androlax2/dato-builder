import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { StringRadioGroupFieldGenerator } from "@/FileGeneration/FieldGenerators/StringRadioGroupFieldGenerator";

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

describe("StringRadioGroupFieldGenerator", () => {
  let stringRadioGroupGenerator: StringRadioGroupFieldGenerator;

  beforeEach(() => {
    stringRadioGroupGenerator = new StringRadioGroupFieldGenerator({
      field: createMockField({
        label: "Test String Radio Group",
        api_key: "test_string_radio_group",
      }),
    });
  });

  describe("getMethodCallName", () => {
    it("returns correct method call name", () => {
      expect(stringRadioGroupGenerator.getMethodCallName()).toBe(
        "addStringRadioGroup",
      );
    });
  });

  describe("generateBuildConfig", () => {
    it("generates basic config with empty radios when no parameters", () => {
      const config = stringRadioGroupGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Test String Radio Group",
        radios: [],
        body: {
          api_key: "test_string_radio_group",
        },
      });
    });

    it("includes hint when present", () => {
      const stringRadioGroupGenerator = new StringRadioGroupFieldGenerator({
        field: createMockField({
          label: "Radio Group with Hint",
          api_key: "radio_group_with_hint",
          hint: "This is a field hint",
        }),
      });

      const config = stringRadioGroupGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a field hint");
    });

    it("extracts radios from appearance parameters", () => {
      const stringRadioGroupGenerator = new StringRadioGroupFieldGenerator({
        field: createMockField({
          label: "Radio Group with Options",
          api_key: "radio_group_with_options",
          appearance: {
            addons: [],
            editor: "string_radio_group",
            parameters: {
              radios: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2", hint: "Second option" },
              ],
            },
          } as any,
        }),
      });

      const config = stringRadioGroupGenerator.generateBuildConfig();
      expect(config.radios).toEqual([
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2", hint: "Second option" },
      ]);
    });

    it("handles radios with all properties", () => {
      const stringRadioGroupGenerator = new StringRadioGroupFieldGenerator({
        field: createMockField({
          label: "Full Radio Group",
          api_key: "full_radio_group",
          appearance: {
            addons: [],
            editor: "string_radio_group",
            parameters: {
              radios: [
                { label: "Yes", value: "yes", hint: "Positive choice" },
                { label: "No", value: "no", hint: "Negative choice" },
                { label: "Maybe", value: "maybe" },
              ],
            },
          } as any,
        }),
      });

      const config = stringRadioGroupGenerator.generateBuildConfig();
      expect(config.radios).toEqual([
        { label: "Yes", value: "yes", hint: "Positive choice" },
        { label: "No", value: "no", hint: "Negative choice" },
        { label: "Maybe", value: "maybe" },
      ]);
    });

    it("includes default value when present", () => {
      const stringRadioGroupGenerator = new StringRadioGroupFieldGenerator({
        field: createMockField({
          label: "Radio Group with Default",
          api_key: "radio_group_with_default",
          default_value: "option1",
        }),
      });

      const config = stringRadioGroupGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe("option1");
    });

    it("includes validators when present", () => {
      const stringRadioGroupGenerator = new StringRadioGroupFieldGenerator({
        field: createMockField({
          label: "Required Radio Group",
          api_key: "required_radio_group",
          validators: {
            required: true,
          } as any,
        }),
      });

      const config = stringRadioGroupGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
    });
  });

  describe("generateMethodCall", () => {
    it("generates basic method call", () => {
      const methodCall = stringRadioGroupGenerator.generateMethodCall();
      expect(methodCall).toContain(".addStringRadioGroup(");
      expect(methodCall).toContain('label: "Test String Radio Group"');
      expect(methodCall).toContain("radios: []");
    });

    it("generates method call with radios", () => {
      const stringRadioGroupGenerator = new StringRadioGroupFieldGenerator({
        field: createMockField({
          label: "Radio Group with Options",
          api_key: "radio_group_with_options",
          appearance: {
            addons: [],
            editor: "string_radio_group",
            parameters: {
              radios: [
                { label: "Option A", value: "a" },
                { label: "Option B", value: "b", hint: "Second option" },
              ],
            },
          } as any,
        }),
      });

      const methodCall = stringRadioGroupGenerator.generateMethodCall();
      expect(methodCall).toContain(".addStringRadioGroup(");
      expect(methodCall).toContain('label: "Radio Group with Options"');
      expect(methodCall).toContain("radios:");
      expect(methodCall).toContain('label: "Option A"');
      expect(methodCall).toContain('value: "a"');
      expect(methodCall).toContain('label: "Option B"');
      expect(methodCall).toContain('value: "b"');
      expect(methodCall).toContain('hint: "Second option"');
    });

    it("generates method call with body properties", () => {
      const stringRadioGroupGenerator = new StringRadioGroupFieldGenerator({
        field: createMockField({
          label: "Complex Radio Group",
          api_key: "complex_radio_group",
          hint: "Choose one option",
          default_value: "option1",
          validators: {
            required: true,
          } as any,
        }),
      });

      const methodCall = stringRadioGroupGenerator.generateMethodCall();
      expect(methodCall).toContain(".addStringRadioGroup(");
      expect(methodCall).toContain('label: "Complex Radio Group"');
      expect(methodCall).toContain('api_key: "complex_radio_group"');
      expect(methodCall).toContain('hint: "Choose one option"');
      expect(methodCall).toContain('default_value: "option1"');
      expect(methodCall).toContain("required: true");
    });
  });
});
