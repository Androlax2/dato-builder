import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { DateConfig } from "@/Fields/Date";
import { DateGenerator } from "@/FileGeneration/FieldGenerators/DateGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "date",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: { addons: [], editor: "date_picker", parameters: {} },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("DateGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a date with label", () => {
      const dateGenerator = new DateGenerator({
        field: createMockField({
          label: "Date",
          api_key: "date",
        }),
      });

      expect(dateGenerator.generateBuildConfig()).toEqual({
        label: "Date",
        body: {
          api_key: "date",
        },
      } satisfies DateConfig);
    });

    it("does not include position", () => {
      const dateGenerator = new DateGenerator({
        field: createMockField({
          label: "Date without Position",
          api_key: "date_without_position",
        }),
      });

      expect(dateGenerator.generateBuildConfig()).toEqual({
        label: "Date without Position",
        body: {
          api_key: "date_without_position",
        },
      } satisfies DateConfig);
    });

    it("can generate a date with a hint", () => {
      const dateGenerator = new DateGenerator({
        field: createMockField({
          label: "Date with Hint",
          api_key: "date_with_hint",
          hint: "This is a test hint",
        }),
      });

      expect(dateGenerator.generateBuildConfig()).toEqual({
        label: "Date with Hint",
        body: {
          api_key: "date_with_hint",
          hint: "This is a test hint",
        },
      } satisfies DateConfig);
    });

    it("can generate a date without a hint", () => {
      const dateGenerator = new DateGenerator({
        field: createMockField({
          label: "Date without Hint",
          api_key: "date_without_hint",
          hint: null,
        }),
      });

      expect(dateGenerator.generateBuildConfig()).toEqual({
        label: "Date without Hint",
        body: {
          api_key: "date_without_hint",
        },
      } satisfies DateConfig);
    });

    it("can generate a date with a default value", () => {
      const dateGenerator = new DateGenerator({
        field: createMockField({
          label: "Date with Default Value",
          api_key: "date_with_default_value",
          default_value: "2025-07-24",
        }),
      });

      expect(dateGenerator.generateBuildConfig()).toEqual({
        label: "Date with Default Value",
        body: {
          api_key: "date_with_default_value",
          default_value: "2025-07-24",
        },
      } satisfies DateConfig);
    });

    it("can generate a date without a default value", () => {
      const dateGenerator = new DateGenerator({
        field: createMockField({
          label: "Date without Default Value",
          api_key: "date_without_default_value",
          default_value: null,
        }),
      });

      expect(dateGenerator.generateBuildConfig()).toEqual({
        label: "Date without Default Value",
        body: {
          api_key: "date_without_default_value",
        },
      } satisfies DateConfig);
    });

    it("should not include validators if none are set", () => {
      const dateGenerator = new DateGenerator({
        field: createMockField({
          label: "Date without Validators",
          api_key: "date_without_validators",
          validators: {},
        }),
      });

      expect(dateGenerator.generateBuildConfig()).toEqual({
        label: "Date without Validators",
        body: {
          api_key: "date_without_validators",
        },
      } satisfies DateConfig);
    });
  });

  describe("With validators", () => {
    describe("Required", () => {
      it("can generate a required date field", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Required Date",
            api_key: "required-date-api-key",
            validators: { required: {} },
          }),
        });

        expect(dateGenerator.generateBuildConfig()).toEqual({
          label: "Required Date",
          body: {
            api_key: "required-date-api-key",
            validators: { required: true },
          },
        } satisfies DateConfig);
      });

      it("can generate a non-required date field", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Non-Required Date",
            api_key: "non-required-date-api-key",
          }),
        });

        expect(dateGenerator.generateBuildConfig()).toEqual({
          label: "Non-Required Date",
          body: {
            api_key: "non-required-date-api-key",
          },
        } satisfies DateConfig);
      });
    });

    describe("Date Range", () => {
      it("can generate a date field with a range", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Date with Range",
            api_key: "date-with-range-api-key",
            validators: {
              date_range: { min: "2020-01-01", max: "2025-12-31" },
            },
          }),
        });

        const config = dateGenerator.generateBuildConfig();

        expect(config.label).toBe("Date with Range");
        expect(config.body?.api_key).toBe("date-with-range-api-key");
        expect(config.body?.validators?.date_range?.min).toBeInstanceOf(Date);
        expect(config.body?.validators?.date_range?.max).toBeInstanceOf(Date);
        expect(config.body?.validators?.date_range?.min).toEqual(
          new Date("2020-01-01"),
        );
        expect(config.body?.validators?.date_range?.max).toEqual(
          new Date("2025-12-31"),
        );
      });

      it("generates method call with new Date() constructor calls", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Date with Range",
            api_key: "date-with-range-api-key",
            validators: {
              date_range: { min: "2020-01-01", max: "2025-12-31" },
            },
          }),
        });

        const methodCall = dateGenerator.generateMethodCall();

        expect(methodCall).toContain('new Date("2020-01-01")');
        expect(methodCall).toContain('new Date("2025-12-31")');
        expect(methodCall).toMatch(/\.addDate\(/);
      });

      it("can generate a date field with a minimum date", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Date with Min",
            api_key: "date-with-min-api-key",
            validators: { date_range: { min: "2020-01-01" } },
          }),
        });

        const config = dateGenerator.generateBuildConfig();

        expect(config.label).toBe("Date with Min");
        expect(config.body?.api_key).toBe("date-with-min-api-key");
        expect(config.body?.validators?.date_range?.min).toBeInstanceOf(Date);
        expect(config.body?.validators?.date_range?.min).toEqual(
          new Date("2020-01-01"),
        );
      });

      it("can generate a date field with a maximum date", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Date with Max",
            api_key: "date-with-max-api-key",
            validators: { date_range: { max: "2025-12-31" } },
          }),
        });

        const config = dateGenerator.generateBuildConfig();

        expect(config.label).toBe("Date with Max");
        expect(config.body?.api_key).toBe("date-with-max-api-key");
        expect(config.body?.validators?.date_range?.max).toBeInstanceOf(Date);
        expect(config.body?.validators?.date_range?.max).toEqual(
          new Date("2025-12-31"),
        );
      });

      it("preserves original format for date-only strings", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Date Format Test",
            api_key: "date-format-test",
            validators: {
              date_range: { min: "2020-01-01", max: "2025-12-31" },
            },
          }),
        });

        const methodCall = dateGenerator.generateMethodCall();

        expect(methodCall).toContain('new Date("2020-01-01")');
        expect(methodCall).toContain('new Date("2025-12-31")');
        expect(methodCall).not.toContain("T00:00:00.000Z");
      });

      it("preserves ISO format for ISO string dates", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "ISO Date Test",
            api_key: "iso-date-test",
            validators: {
              date_range: {
                min: "2020-01-01T09:30:00.000Z",
                max: "2025-12-31T23:59:59.999Z",
              },
            },
          }),
        });

        const methodCall = dateGenerator.generateMethodCall();

        expect(methodCall).toContain('new Date("2020-01-01T09:30:00.000Z")');
        expect(methodCall).toContain('new Date("2025-12-31T23:59:59.999Z")');
      });

      it("handles mixed date-only and ISO formats", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Mixed Format Test",
            api_key: "mixed-format-test",
            validators: {
              date_range: {
                min: "2020-01-01",
                max: "2025-12-31T23:59:59.999Z",
              },
            },
          }),
        });

        const methodCall = dateGenerator.generateMethodCall();

        expect(methodCall).toContain('new Date("2020-01-01")');
        expect(methodCall).toContain('new Date("2025-12-31T23:59:59.999Z")');
      });

      it("handles edge case date formats", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Edge Case Dates",
            api_key: "edge-case-dates",
            validators: {
              date_range: {
                min: "1970-01-01",
                max: "9999-12-31",
              },
            },
          }),
        });

        const config = dateGenerator.generateBuildConfig();

        expect(config.body?.validators?.date_range?.min).toBeInstanceOf(Date);
        expect(config.body?.validators?.date_range?.max).toBeInstanceOf(Date);
        expect(
          config.body?.validators?.date_range?.min
            ?.toISOString()
            .startsWith("1970"),
        ).toBe(true);
        expect(config.body?.validators?.date_range?.max?.getFullYear()).toBe(
          9999,
        );
      });
    });
  });
});
