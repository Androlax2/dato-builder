import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import ItemTypeBuilder from "../../src/ItemTypeBuilder";

jest.mock("../../src/config/loader", () => ({
  loadDatoBuilderConfig: jest.fn(() => ({
    overwriteExistingFields: false,
  })),
}));

class TestBuilder extends ItemTypeBuilder {
  constructor() {
    super("model", { name: "TestModel" });
  }
}

describe("addEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a email field", () => {
    const builder = new TestBuilder();

    builder.addEmail({
      label: "Email",
      body: {
        api_key: "email",
      },
    });

    const fieldDefinition = builder.getField("email");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "email",
      field_type: "string",
      label: "Email",
      position: 1,
      validators: {
        format: {
          predefined_pattern: "email",
        },
      },
    });
  });

  it("can pass additional body properties", () => {
    const builder = new TestBuilder();

    builder.addEmail({
      label: "Email",
      body: {
        api_key: "email",
        hint: "This is a hint",
      },
    });

    const fieldDefinition = builder.getField("email");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "email",
      field_type: "string",
      label: "Email",
      position: 1,
      hint: "This is a hint",
      validators: {
        format: {
          predefined_pattern: "email",
        },
      },
    });
  });

  it("cannot change the predefined pattern", () => {
    const builder = new TestBuilder();

    expect(() => {
      builder.addEmail({
        label: "Email",
        body: {
          api_key: "email",
          validators: {
            format: {
              predefined_pattern: "url",
            },
          },
        },
      });
    }).toThrowError(
      "The `predefined_pattern` for the format validator must be 'email' for Email fields.",
    );
  });

  it("does not throw error if the predefined pattern is email", () => {
    const builder = new TestBuilder();

    expect(() => {
      builder.addEmail({
        label: "Email",
        body: {
          api_key: "email",
          validators: {
            format: {
              predefined_pattern: "email",
            },
          },
        },
      });
    }).not.toThrowError();
  });

  it("can pass additional validators", () => {
    const builder = new TestBuilder();

    builder.addEmail({
      label: "Email",
      body: {
        api_key: "email",
        validators: {
          required: true,
          unique: true,
        },
      },
    });

    const fieldDefinition = builder.getField("email");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "email",
      field_type: "string",
      label: "Email",
      position: 1,
      validators: {
        required: {},
        unique: {},
        format: {
          predefined_pattern: "email",
        },
      },
    });
  });

  it("can pass custom regex", () => {
    const builder = new TestBuilder();

    builder.addEmail({
      label: "Email",
      body: {
        api_key: "email",
        validators: {
          format: {
            custom_pattern: /https?:\/\/.+/i,
          },
        },
      },
    });

    const fieldDefinition = builder.getField("email");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "email",
      field_type: "string",
      label: "Email",
      position: 1,
      validators: {
        format: {
          custom_pattern: "/https?:\\/\\/.+/i",
        },
      },
    });
  });

  it("merge format with email predefined pattern", () => {
    const builder = new TestBuilder();

    builder.addEmail({
      label: "Email",
      body: {
        api_key: "email",
        validators: {
          format: { description: "Foo", custom_pattern: /https?:\/\/.+/i },
        },
      },
    });

    const fieldDefinition = builder.getField("email");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "email",
      field_type: "string",
      label: "Email",
      position: 1,
      validators: {
        format: {
          custom_pattern: "/https?:\\/\\/.+/i",
          description: "Foo",
        },
      },
    });
  });
});
