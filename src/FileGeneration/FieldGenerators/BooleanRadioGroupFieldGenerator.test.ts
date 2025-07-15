import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { BooleanRadioGroupConfig } from "@/Fields/BooleanRadioGroup";
import { BooleanRadioGroupFieldGenerator } from "@/FileGeneration/FieldGenerators/BooleanRadioGroupFieldGenerator";

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
    appearance: {
      addons: [],
      editor: "boolean_radio_group",
      parameters: {
        positive_radio: { label: "Yes", hint: "Select for true" },
        negative_radio: { label: "No", hint: "Select for false" },
      },
    } as any,
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("BooleanRadioGroupFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a boolean radio group field with label and radio options", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Agree to Terms",
          api_key: "agree_to_terms",
        }),
      });

      expect(booleanRadioGroupGenerator.generateBuildConfig()).toEqual({
        label: "Agree to Terms",
        positive_radio: { label: "Yes", hint: "Select for true" },
        negative_radio: { label: "No", hint: "Select for false" },
        body: {
          api_key: "agree_to_terms",
        },
      } satisfies BooleanRadioGroupConfig);
    });

    it("returns correct method call name", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(booleanRadioGroupGenerator.getMethodCallName()).toBe(
        "addBooleanRadioGroup",
      );
    });

    it("includes hint when present", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Boolean Radio Group with Hint",
          api_key: "boolean_radio_group_with_hint",
          hint: "This is a field hint",
        }),
      });

      const config = booleanRadioGroupGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a field hint");
    });

    it("includes default_value when present", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Boolean Radio Group with Default",
          api_key: "boolean_radio_group_with_default",
          default_value: true,
        }),
      });

      const config = booleanRadioGroupGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe(true);
    });

    it("handles custom radio labels", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Custom Radio Labels",
          api_key: "custom_radio_labels",
          appearance: {
            addons: [],
            editor: "boolean_radio_group",
            parameters: {
              positive_radio: { label: "Enable", hint: "Turn this on" },
              negative_radio: { label: "Disable", hint: "Turn this off" },
            },
          } as any,
        }),
      });

      const config = booleanRadioGroupGenerator.generateBuildConfig();
      expect(config.positive_radio).toEqual({
        label: "Enable",
        hint: "Turn this on",
      });
      expect(config.negative_radio).toEqual({
        label: "Disable",
        hint: "Turn this off",
      });
    });

    it("handles radio labels without hints", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "No Hints Radio",
          api_key: "no_hints_radio",
          appearance: {
            addons: [],
            editor: "boolean_radio_group",
            parameters: {
              positive_radio: { label: "True" },
              negative_radio: { label: "False" },
            },
          } as any,
        }),
      });

      const config = booleanRadioGroupGenerator.generateBuildConfig();
      expect(config.positive_radio).toEqual({ label: "True" });
      expect(config.negative_radio).toEqual({ label: "False" });
    });

    it("handles missing radio parameters with defaults", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Default Radio Labels",
          api_key: "default_radio_labels",
          appearance: {
            addons: [],
            editor: "boolean_radio_group",
            parameters: {},
          } as any,
        }),
      });

      const config = booleanRadioGroupGenerator.generateBuildConfig();
      expect(config.positive_radio).toEqual({ label: "Yes" });
      expect(config.negative_radio).toEqual({ label: "No" });
    });

    it("handles empty appearance parameters", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Empty Parameters",
          api_key: "empty_parameters",
          appearance: {
            addons: [],
            editor: "boolean_radio_group",
            parameters: undefined,
          } as any,
        }),
      });

      const config = booleanRadioGroupGenerator.generateBuildConfig();
      expect(config.positive_radio).toEqual({ label: "Yes" });
      expect(config.negative_radio).toEqual({ label: "No" });
    });
  });

  describe("Method call generation", () => {
    it("generates correct method call string", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Test Boolean Radio Group",
          api_key: "test_boolean_radio_group",
          hint: "Test hint",
        }),
      });

      const methodCall = booleanRadioGroupGenerator.generateMethodCall();
      expect(methodCall).toContain(".addBooleanRadioGroup(");
      expect(methodCall).toContain('label: "Test Boolean Radio Group"');
      expect(methodCall).toContain('api_key: "test_boolean_radio_group"');
      expect(methodCall).toContain('hint: "Test hint"');
      expect(methodCall).toContain("positive_radio");
      expect(methodCall).toContain("negative_radio");
    });

    it("generates method call with custom radio labels", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Custom Radio",
          api_key: "custom_radio",
          appearance: {
            addons: [],
            editor: "boolean_radio_group",
            parameters: {
              positive_radio: { label: "Approve", hint: "Click to approve" },
              negative_radio: { label: "Reject", hint: "Click to reject" },
            },
          } as any,
        }),
      });

      const methodCall = booleanRadioGroupGenerator.generateMethodCall();
      expect(methodCall).toContain('label: "Approve"');
      expect(methodCall).toContain('hint: "Click to approve"');
      expect(methodCall).toContain('label: "Reject"');
      expect(methodCall).toContain('hint: "Click to reject"');
    });

    it("generates minimal method call", () => {
      const booleanRadioGroupGenerator = new BooleanRadioGroupFieldGenerator({
        field: createMockField({
          label: "Simple Radio Group",
          api_key: "simple_radio_group",
          appearance: {
            addons: [],
            editor: "boolean_radio_group",
            parameters: {
              positive_radio: { label: "On" },
              negative_radio: { label: "Off" },
            },
          } as any,
        }),
      });

      const methodCall = booleanRadioGroupGenerator.generateMethodCall();
      expect(methodCall).toContain(".addBooleanRadioGroup(");
      expect(methodCall).toContain('label: "Simple Radio Group"');
      expect(methodCall).toContain('api_key: "simple_radio_group"');
      expect(methodCall).toContain('label: "On"');
      expect(methodCall).toContain('label: "Off"');
    });
  });
});
