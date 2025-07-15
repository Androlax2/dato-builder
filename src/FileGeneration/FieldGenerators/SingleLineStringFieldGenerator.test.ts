import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { SingleLineStringFieldGenerator } from "@/FileGeneration/FieldGenerators/SingleLineStringFieldGenerator";

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

describe("SingleLineStringFieldGenerator", () => {
  let singleLineStringGenerator: SingleLineStringFieldGenerator;

  beforeEach(() => {
    singleLineStringGenerator = new SingleLineStringFieldGenerator({
      field: createMockField({
        label: "Test Single Line String",
        api_key: "test_single_line_string",
      }),
    });
  });

  describe("getMethodCallName", () => {
    it("returns correct method call name", () => {
      expect(singleLineStringGenerator.getMethodCallName()).toBe(
        "addSingleLineString",
      );
    });
  });

  describe("generateBuildConfig", () => {
    it("generates basic config without body or options when no additional properties", () => {
      const config = singleLineStringGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Test Single Line String",
        body: {
          api_key: "test_single_line_string",
        },
      });
    });

    it("includes hint when present", () => {
      const singleLineStringGenerator = new SingleLineStringFieldGenerator({
        field: createMockField({
          label: "String with Hint",
          api_key: "string_with_hint",
          hint: "This is a field hint",
        }),
      });

      const config = singleLineStringGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a field hint");
    });

    it("includes default value when present", () => {
      const singleLineStringGenerator = new SingleLineStringFieldGenerator({
        field: createMockField({
          label: "String with Default",
          api_key: "string_with_default",
          default_value: "Default text",
        }),
      });

      const config = singleLineStringGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe("Default text");
    });

    it("includes heading option when present", () => {
      const singleLineStringGenerator = new SingleLineStringFieldGenerator({
        field: createMockField({
          label: "Heading String",
          api_key: "heading_string",
          appearance: {
            addons: [],
            editor: "single_line",
            parameters: {
              heading: true,
            },
          } as any,
        }),
      });

      const config = singleLineStringGenerator.generateBuildConfig();
      expect(config.options?.heading).toBe(true);
    });

    it("includes placeholder option when present", () => {
      const singleLineStringGenerator = new SingleLineStringFieldGenerator({
        field: createMockField({
          label: "String with Placeholder",
          api_key: "string_with_placeholder",
          appearance: {
            addons: [],
            editor: "single_line",
            parameters: {
              placeholder: "Enter text here...",
            },
          } as any,
        }),
      });

      const config = singleLineStringGenerator.generateBuildConfig();
      expect(config.options?.placeholder).toBe("Enter text here...");
    });

    it("includes both heading and placeholder options", () => {
      const singleLineStringGenerator = new SingleLineStringFieldGenerator({
        field: createMockField({
          label: "Complex String",
          api_key: "complex_string",
          appearance: {
            addons: [],
            editor: "single_line",
            parameters: {
              heading: true,
              placeholder: "Enter title here...",
            },
          } as any,
        }),
      });

      const config = singleLineStringGenerator.generateBuildConfig();
      expect(config.options?.heading).toBe(true);
      expect(config.options?.placeholder).toBe("Enter title here...");
    });

    it("excludes options when parameters are empty", () => {
      const singleLineStringGenerator = new SingleLineStringFieldGenerator({
        field: createMockField({
          label: "String with Empty Parameters",
          api_key: "string_with_empty_parameters",
          appearance: {
            addons: [],
            editor: "single_line",
            parameters: {},
          } as any,
        }),
      });

      const config = singleLineStringGenerator.generateBuildConfig();
      expect(config.options).toBeUndefined();
    });

    it("includes validators when present", () => {
      const singleLineStringGenerator = new SingleLineStringFieldGenerator({
        field: createMockField({
          label: "Required String",
          api_key: "required_string",
          validators: {
            required: true,
            length: {
              min: 5,
              max: 100,
            },
          } as any,
        }),
      });

      const config = singleLineStringGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
      expect(config.body?.validators?.length).toEqual({
        min: 5,
        max: 100,
      });
    });
  });

  describe("generateMethodCall", () => {
    it("generates basic method call", () => {
      const methodCall = singleLineStringGenerator.generateMethodCall();
      expect(methodCall).toContain(".addSingleLineString(");
      expect(methodCall).toContain('label: "Test Single Line String"');
    });

    it("generates method call with options", () => {
      const singleLineStringGenerator = new SingleLineStringFieldGenerator({
        field: createMockField({
          label: "Heading String",
          api_key: "heading_string",
          appearance: {
            addons: [],
            editor: "single_line",
            parameters: {
              heading: true,
              placeholder: "Enter title...",
            },
          } as any,
        }),
      });

      const methodCall = singleLineStringGenerator.generateMethodCall();
      expect(methodCall).toContain(".addSingleLineString(");
      expect(methodCall).toContain('label: "Heading String"');
      expect(methodCall).toContain("options:");
      expect(methodCall).toContain("heading: true");
      expect(methodCall).toContain('placeholder: "Enter title..."');
    });

    it("generates method call with body properties", () => {
      const singleLineStringGenerator = new SingleLineStringFieldGenerator({
        field: createMockField({
          label: "Complex String",
          api_key: "complex_string",
          hint: "Enter some text",
          default_value: "Default value",
          validators: {
            required: true,
          } as any,
        }),
      });

      const methodCall = singleLineStringGenerator.generateMethodCall();
      expect(methodCall).toContain(".addSingleLineString(");
      expect(methodCall).toContain('label: "Complex String"');
      expect(methodCall).toContain('api_key: "complex_string"');
      expect(methodCall).toContain('hint: "Enter some text"');
      expect(methodCall).toContain('default_value: "Default value"');
      expect(methodCall).toContain("required: true");
    });
  });
});
