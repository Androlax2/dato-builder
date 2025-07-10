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

describe("addUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a URL field", () => {
    const builder = new TestBuilder();

    builder.addUrl({
      label: "Website",
      body: {
        api_key: "website_url",
      },
    });

    const fieldDefinition = builder.getField("website_url");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "website_url",
      field_type: "string",
      label: "Website",
      position: 1,
      validators: {
        format: {
          predefined_pattern: "url",
        },
      },
    });
  });

  it("can pass additional body properties", () => {
    const builder = new TestBuilder();

    builder.addUrl({
      label: "Website",
      body: {
        api_key: "website_url",
        hint: "This is a hint",
      },
    });

    const fieldDefinition = builder.getField("website_url");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "website_url",
      field_type: "string",
      label: "Website",
      position: 1,
      hint: "This is a hint",
      validators: {
        format: {
          predefined_pattern: "url",
        },
      },
    });
  });

  it("cannot change the predefined pattern", () => {
    const builder = new TestBuilder();

    expect(() => {
      builder.addUrl({
        label: "Website",
        body: {
          api_key: "website_url",
          validators: {
            format: {
              predefined_pattern: "email",
            },
          },
        },
      });
    }).toThrow(
      "The `predefined_pattern` for the format validator must be 'url' for Url fields.",
    );
  });

  it("does not throw error if the predefined pattern is url", () => {
    const builder = new TestBuilder();

    expect(() => {
      builder.addUrl({
        label: "Website",
        body: {
          api_key: "website_url",
          validators: {
            format: {
              predefined_pattern: "url",
            },
          },
        },
      });
    }).not.toThrow();
  });

  it("can pass additional validators", () => {
    const builder = new TestBuilder();

    builder.addUrl({
      label: "Website",
      body: {
        api_key: "website_url",
        validators: {
          required: true,
          unique: true,
        },
      },
    });

    const fieldDefinition = builder.getField("website_url");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "website_url",
      field_type: "string",
      label: "Website",
      position: 1,
      validators: {
        required: {},
        unique: {},
        format: {
          predefined_pattern: "url",
        },
      },
    });
  });

  it("can pass custom regex", () => {
    const builder = new TestBuilder();

    builder.addUrl({
      label: "Website",
      body: {
        api_key: "website_url",
        validators: {
          format: {
            custom_pattern: /https?:\/\/.+/i,
          },
        },
      },
    });

    const fieldDefinition = builder.getField("website_url");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "website_url",
      field_type: "string",
      label: "Website",
      position: 1,
      validators: {
        format: {
          custom_pattern: "/https?:\\/\\/.+/i",
        },
      },
    });
  });

  it("merge format with url predefined pattern", () => {
    const builder = new TestBuilder();

    builder.addUrl({
      label: "Website",
      body: {
        api_key: "website_url",
        validators: {
          format: { description: "Foo", custom_pattern: /https?:\/\/.+/i },
        },
      },
    });

    const fieldDefinition = builder.getField("website_url");

    expect(fieldDefinition).toBeDefined();
    expect(fieldDefinition?.body).toEqual({
      api_key: "website_url",
      field_type: "string",
      label: "Website",
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
