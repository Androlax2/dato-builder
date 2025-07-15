import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { EmailFieldGenerator } from "@/FileGeneration/FieldGenerators/EmailFieldGenerator";

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

describe("EmailFieldGenerator", () => {
  let emailGenerator: EmailFieldGenerator;

  beforeEach(() => {
    emailGenerator = new EmailFieldGenerator({
      field: createMockField({
        label: "Test Email",
        api_key: "test_email",
      }),
    });
  });

  describe("getMethodCallName", () => {
    it("returns correct method call name", () => {
      expect(emailGenerator.getMethodCallName()).toBe("addEmail");
    });
  });

  describe("generateBuildConfig", () => {
    it("generates basic config without body when no additional properties", () => {
      const config = emailGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Test Email",
        body: {
          api_key: "test_email",
        },
      });
    });

    it("includes hint when present", () => {
      const emailGenerator = new EmailFieldGenerator({
        field: createMockField({
          label: "Email with Hint",
          api_key: "email_with_hint",
          hint: "This is a field hint",
        }),
      });

      const config = emailGenerator.generateBuildConfig();
      expect(config.body?.hint).toBe("This is a field hint");
    });

    it("includes default value when present", () => {
      const emailGenerator = new EmailFieldGenerator({
        field: createMockField({
          label: "Email with Default",
          api_key: "email_with_default",
          default_value: "test@example.com",
        }),
      });

      const config = emailGenerator.generateBuildConfig();
      expect(config.body?.default_value).toBe("test@example.com");
    });

    it("includes validators when present", () => {
      const emailGenerator = new EmailFieldGenerator({
        field: createMockField({
          label: "Required Email",
          api_key: "required_email",
          validators: {
            required: true,
            format: {
              predefined_pattern: "email",
            },
          } as any,
        }),
      });

      const config = emailGenerator.generateBuildConfig();
      expect(config.body?.validators?.required).toBe(true);
      expect(config.body?.validators?.format).toEqual({
        predefined_pattern: "email",
      });
    });
  });

  describe("generateMethodCall", () => {
    it("generates basic method call", () => {
      const methodCall = emailGenerator.generateMethodCall();
      expect(methodCall).toContain(".addEmail(");
      expect(methodCall).toContain('label: "Test Email"');
    });

    it("generates method call with body properties", () => {
      const emailGenerator = new EmailFieldGenerator({
        field: createMockField({
          label: "Complex Email",
          api_key: "complex_email",
          hint: "Enter your email address",
          default_value: "user@example.com",
          validators: {
            required: true,
            format: {
              predefined_pattern: "email",
            },
          } as any,
        }),
      });

      const methodCall = emailGenerator.generateMethodCall();
      expect(methodCall).toContain(".addEmail(");
      expect(methodCall).toContain('label: "Complex Email"');
      expect(methodCall).toContain('api_key: "complex_email"');
      expect(methodCall).toContain('hint: "Enter your email address"');
      expect(methodCall).toContain('default_value: "user@example.com"');
      expect(methodCall).toContain("required: true");
      expect(methodCall).toContain("format:");
    });
  });
});
