import type { FieldCreateSchema } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

jest.mock("../Validators/Validators", () => ({
  __esModule: true,
  default: class MockValidators {
    validators: ValidatorConfig;

    constructor(validators: ValidatorConfig = {}) {
      this.validators = validators;
    }

    build(): Record<string, object | undefined> {
      // Convert boolean validators to objects for testing purposes
      const result: Record<string, object | undefined> = {};
      for (const [key, value] of Object.entries(this.validators)) {
        if (typeof value === "boolean" && value === true) {
          result[key] = {};
        } else if (value !== undefined) {
          result[key] = typeof value === "object" ? value : {};
        }
      }
      return result;
    }
  },
}));

// Create a test subclass of Field for testing the abstract base class
class TestField extends Field {
  constructor(body: FieldBody) {
    super("text" as FieldCreateSchema["field_type"], body);
  }
}

describe("Field", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a field with the provided type and body", () => {
    const testField = new TestField({
      label: "Test Field",
    });

    expect(testField.build()).toEqual({
      label: "Test Field",
      field_type: "text",
      api_key: "test_field",
      validators: {},
    });
  });

  it("should use the provided api_key if present", () => {
    const testField = new TestField({
      label: "Test Field",
      api_key: "custom_api_key",
    });

    expect(testField.build().api_key).toBe("custom_api_key");
  });

  it("should generate an api_key if not provided", () => {
    const testField = new TestField({
      label: "Test Field",
    });

    expect(testField.build().api_key).toBe("test_field");
  });

  it("should generate a plural api_key if label is plural", () => {
    const testField = new TestField({
      label: "Test Fields",
    });

    expect(testField.build().api_key).toBe("test_fields");
  });

  it("should pass validators to the Validators class", () => {
    const validators = { required: true };
    const testField = new TestField({
      label: "Test Field",
      validators,
    });

    expect(testField.build().validators).toEqual({ required: {} });
  });

  it("should preserve additional properties from the body", () => {
    const testField = new TestField({
      label: "Test Field",
      hint: "This is a hint",
      appearance: {
        type: "custom",
        editor: "",
        parameters: {},
        addons: body?.addons || [],
      },
      position: 1,
    });

    expect(testField.build()).toEqual({
      label: "Test Field",
      field_type: "text",
      api_key: "test_field",
      hint: "This is a hint",
      appearance: { type: "custom", editor: "", parameters: {}, addons: [] },
      position: 1,
      validators: {},
    });
  });
});
