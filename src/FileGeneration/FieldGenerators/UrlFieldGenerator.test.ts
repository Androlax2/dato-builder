import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { UrlFieldGenerator } from "@/FileGeneration/FieldGenerators/UrlFieldGenerator";

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

describe("UrlFieldGenerator", () => {
  let urlGenerator: UrlFieldGenerator;

  beforeEach(() => {
    urlGenerator = new UrlFieldGenerator({
      field: createMockField({
        label: "Test URL",
        api_key: "test_url",
      }),
    });
  });

  describe("getMethodCallName", () => {
    it("returns correct method call name", () => {
      expect(urlGenerator.getMethodCallName()).toBe("addUrl");
    });
  });

  describe("generateBuildConfig", () => {
    it("generates basic config without body when no additional properties", () => {
      const config = urlGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Test URL",
        body: {
          api_key: "test_url",
        },
      });
    });

    it("includes hint when present", () => {
      const urlGenerator = new UrlFieldGenerator({
        field: createMockField({
          label: "URL with Hint",
          api_key: "url_with_hint",
          hint: "This is a field hint",
        }),
      });

      const config = urlGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a field hint");
    });

    it("includes default value when present", () => {
      const urlGenerator = new UrlFieldGenerator({
        field: createMockField({
          label: "URL with Default",
          api_key: "url_with_default",
          default_value: "https://example.com",
        }),
      });

      const config = urlGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe("https://example.com");
    });

    it("includes validators when present", () => {
      const urlGenerator = new UrlFieldGenerator({
        field: createMockField({
          label: "Required URL",
          api_key: "required_url",
          validators: {
            required: true,
            format: {
              predefined_pattern: "url",
            },
          } as any,
        }),
      });

      const config = urlGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
      expect(config.body?.validators?.format).toEqual({
        predefined_pattern: "url",
      });
    });
  });

  describe("generateMethodCall", () => {
    it("generates basic method call", () => {
      const methodCall = urlGenerator.generateMethodCall();
      expect(methodCall).toContain(".addUrl(");
      expect(methodCall).toContain('label: "Test URL"');
    });

    it("generates method call with body properties", () => {
      const urlGenerator = new UrlFieldGenerator({
        field: createMockField({
          label: "Complex URL",
          api_key: "complex_url",
          hint: "Enter a valid URL",
          default_value: "https://example.com",
          validators: {
            required: true,
            format: {
              predefined_pattern: "url",
            },
          } as any,
        }),
      });

      const methodCall = urlGenerator.generateMethodCall();
      expect(methodCall).toContain(".addUrl(");
      expect(methodCall).toContain('label: "Complex URL"');
      expect(methodCall).toContain('api_key: "complex_url"');
      expect(methodCall).toContain('hint: "Enter a valid URL"');
      expect(methodCall).toContain('default_value: "https://example.com"');
      expect(methodCall).toContain("required: true");
      expect(methodCall).toContain("format:");
    });
  });
});
