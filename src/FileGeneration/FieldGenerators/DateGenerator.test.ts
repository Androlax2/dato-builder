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
    hint: "test hint",
    localized: false,
    validators: {},
    position: 1,
    appearance: { addons: [], editor: "date_picker", parameters: {} },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("DateGenerator", () => {
  it("can generate a date with label, position, api_key", () => {
    const dateGenerator = new DateGenerator({
      field: createMockField({
        label: "Date",
        api_key: "test-date-api-key",
      }),
    });

    expect(dateGenerator.generateBuildConfig()).toEqual({
      label: "Date",
      body: {
        api_key: "test-date-api-key",
        position: 1,
      },
    } satisfies DateConfig);
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
            position: 1,
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
            position: 1,
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
            validators: { range: { min: "2020-01-01", max: "2025-12-31" } },
          }),
        });

        expect(dateGenerator.generateBuildConfig()).toEqual({
          label: "Date with Range",
          body: {
            api_key: "date-with-range-api-key",
            position: 1,
            validators: {
              date_range: {
                min: new Date("2020-01-01"),
                max: new Date("2025-12-31"),
              },
            },
          },
        } satisfies DateConfig);
      });

      it("can generate a date field with a minimum date", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Date with Min",
            api_key: "date-with-min-api-key",
            validators: { min_date: "2020-01-01" },
          }),
        });

        expect(dateGenerator.generateBuildConfig()).toEqual({
          label: "Date with Min",
          body: {
            api_key: "date-with-min-api-key",
            position: 1,
            validators: {
              date_range: {
                min: new Date("2020-01-01"),
              },
            },
          },
        } satisfies DateConfig);
      });

      it("can generate a date field with a maximum date", () => {
        const dateGenerator = new DateGenerator({
          field: createMockField({
            label: "Date with Max",
            api_key: "date-with-max-api-key",
            validators: { max_date: "2025-12-31" },
          }),
        });

        expect(dateGenerator.generateBuildConfig()).toEqual({
          label: "Date with Max",
          body: {
            api_key: "date-with-max-api-key",
            position: 1,
            validators: {
              date_range: {
                max: new Date("2025-12-31"),
              },
            },
          },
        } satisfies DateConfig);
      });
    });
  });

  describe("With default value", () => {
    it("can generate a date field with a default value", () => {
      const dateGenerator = new DateGenerator({
        field: createMockField({
          label: "Date with Default",
          api_key: "date-with-default-api-key",
          default_value: "2025-07-24",
        }),
      });

      expect(dateGenerator.generateBuildConfig()).toEqual({
        label: "Date with Default",
        body: {
          api_key: "date-with-default-api-key",
          position: 1,
          default_value: "2025-07-24",
        },
      } satisfies DateConfig);
    });

    it("can generate a date field without a default value", () => {
      const dateGenerator = new DateGenerator({
        field: createMockField({
          label: "Date without Default",
          api_key: "date-without-default-api-key",
        }),
      });

      expect(dateGenerator.generateBuildConfig()).toEqual({
        label: "Date without Default",
        body: {
          api_key: "date-without-default-api-key",
          position: 1,
        },
      } satisfies DateConfig);
    });
  });
});
