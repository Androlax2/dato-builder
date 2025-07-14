import { describe, expect, it } from "@jest/globals";
import RequiredSeoFieldsValidator from "../../src/Validators/RequiredSeoFieldsValidator";

describe("RequiredSeoFieldsValidator", () => {
  it('should have a key of "required_seo_fields"', () => {
    const validator = new RequiredSeoFieldsValidator({
      title: true,
      description: true,
    });
    expect(validator.key).toBe("required_seo_fields");
  });

  it("should throw an error if no fields are specified", () => {
    expect(() => {
      new RequiredSeoFieldsValidator({});
    }).toThrow(
      "At least one parameter must be specified for required_seo_fields.",
    );
  });

  it("should not throw an error if at least one field is specified", () => {
    expect(() => {
      new RequiredSeoFieldsValidator({ title: true });
    }).not.toThrow();

    expect(() => {
      new RequiredSeoFieldsValidator({ description: true });
    }).not.toThrow();

    expect(() => {
      new RequiredSeoFieldsValidator({ image: true });
    }).not.toThrow();

    expect(() => {
      new RequiredSeoFieldsValidator({ twitter_card: true });
    }).not.toThrow();
  });

  it("should create validator with multiple fields", () => {
    const validator = new RequiredSeoFieldsValidator({
      title: true,
      description: true,
      image: false,
    });

    expect(validator.build()).toMatchObject({
      title: true,
      description: true,
      image: false,
    });
  });

  it("should handle undefined values and convert them to boolean false", () => {
    const validator = new RequiredSeoFieldsValidator({
      title: true,
      description: undefined,
    });

    const config = validator.build();

    expect(config).toMatchObject({
      title: true,
      description: false,
    });
  });

  it("should ensure all values are in build output as boolean", () => {
    const validator = new RequiredSeoFieldsValidator({
      title: true,
    });

    expect(validator.build()).toEqual({
      title: true,
      description: false,
      image: false,
      twitter_card: false,
    });
  });
});
