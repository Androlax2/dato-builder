import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import Integer from "../../src/Fields/Integer";

describe("Integer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an integer field with the correct type", () => {
    const integerField = new Integer({
      label: "Age",
    });

    expect(integerField.build().field_type).toBe("integer");
  });

  it("should correctly pass label to the parent constructor", () => {
    const integerField = new Integer({
      label: "Age",
    });

    expect(integerField.build().label).toBe("Age");
  });

  it("should handle validators specific to integer fields", () => {
    const integerField = new Integer({
      label: "Age",
      body: {
        validators: {
          required: true,
          number_range: {
            min: 18,
            max: 100,
          },
        },
      },
    });

    expect(integerField.build().validators).toEqual({
      number_range: {
        min: 18,
        max: 100,
      },
      required: {},
    });
  });

  it("should correctly pass additional body properties", () => {
    const integerField = new Integer({
      label: "Age",
      body: {
        hint: "Enter your age",
        position: 3,
        appearance: {
          type: "number",
          editor: "number",
          parameters: {},
          addons: [],
        },
      },
    });

    expect(integerField.build()).toEqual({
      label: "Age",
      field_type: "integer",
      api_key: "age",
      hint: "Enter your age",
      position: 3,
      appearance: {
        type: "number",
        editor: "number",
        parameters: {},
        addons: [],
      },
      validators: {},
    });
  });

  it("should use a custom api_key when provided in the body", () => {
    const integerField = new Integer({
      label: "Age",
      body: {
        api_key: "user_age",
      },
    });

    expect(integerField.build().api_key).toBe("user_age");
  });
});
