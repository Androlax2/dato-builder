import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { DateTimeConfig } from "@/Fields/DateTime";
import { DateTimeFieldGenerator } from "@/FileGeneration/FieldGenerators/DateTimeFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "date_time",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: { addons: [], editor: "date_time_picker", parameters: {} },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("DateTimeFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a datetime with label", () => {
      const dateTimeGenerator = new DateTimeFieldGenerator({
        field: createMockField({
          label: "Date time",
          api_key: "date_time",
        }),
      });

      expect(dateTimeGenerator.generateBuildConfig()).toEqual({
        label: "Date time",
        body: {
          api_key: "date_time",
        },
      } satisfies DateTimeConfig);
    });

    it("does not include position", () => {
      const dateTimeGenerator = new DateTimeFieldGenerator({
        field: createMockField({
          label: "DateTime without Position",
          api_key: "datetime_without_position",
        }),
      });

      expect(dateTimeGenerator.generateBuildConfig()).toEqual({
        label: "DateTime without Position",
        body: {
          api_key: "datetime_without_position",
        },
      } satisfies DateTimeConfig);
    });

    it("can generate a datetime with a hint", () => {
      const dateTimeGenerator = new DateTimeFieldGenerator({
        field: createMockField({
          label: "Date time",
          api_key: "date_time",
          hint: "dfggdfs",
        }),
      });

      expect(dateTimeGenerator.generateBuildConfig()).toEqual({
        label: "Date time",
        body: {
          api_key: "date_time",
          hint: "dfggdfs",
        },
      } satisfies DateTimeConfig);
    });

    it("can generate a datetime without a hint", () => {
      const dateTimeGenerator = new DateTimeFieldGenerator({
        field: createMockField({
          label: "DateTime without Hint",
          api_key: "datetime_without_hint",
          hint: null,
        }),
      });

      expect(dateTimeGenerator.generateBuildConfig()).toEqual({
        label: "DateTime without Hint",
        body: {
          api_key: "datetime_without_hint",
        },
      } satisfies DateTimeConfig);
    });

    it("can generate a datetime with a default value", () => {
      const dateTimeGenerator = new DateTimeFieldGenerator({
        field: createMockField({
          label: "DateTime with Default Value",
          api_key: "datetime_with_default_value",
          default_value: "2025-07-10T05:00:00+01:00",
        }),
      });

      expect(dateTimeGenerator.generateBuildConfig()).toEqual({
        label: "DateTime with Default Value",
        body: {
          api_key: "datetime_with_default_value",
          default_value: "2025-07-10T05:00:00+01:00",
        },
      } satisfies DateTimeConfig);
    });

    it("can generate a datetime without a default value", () => {
      const dateTimeGenerator = new DateTimeFieldGenerator({
        field: createMockField({
          label: "DateTime without Default Value",
          api_key: "datetime_without_default_value",
          default_value: null,
        }),
      });

      expect(dateTimeGenerator.generateBuildConfig()).toEqual({
        label: "DateTime without Default Value",
        body: {
          api_key: "datetime_without_default_value",
        },
      } satisfies DateTimeConfig);
    });

    it("should not include validators if none are set", () => {
      const dateTimeGenerator = new DateTimeFieldGenerator({
        field: createMockField({
          label: "DateTime without Validators",
          api_key: "datetime_without_validators",
          validators: {},
        }),
      });

      expect(dateTimeGenerator.generateBuildConfig()).toEqual({
        label: "DateTime without Validators",
        body: {
          api_key: "datetime_without_validators",
        },
      } satisfies DateTimeConfig);
    });
  });

  describe("With validators", () => {
    describe("Required", () => {
      it("can generate a required datetime field", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "Required DateTime",
            api_key: "required-datetime-api-key",
            validators: { required: {} },
          }),
        });

        expect(dateTimeGenerator.generateBuildConfig()).toEqual({
          label: "Required DateTime",
          body: {
            api_key: "required-datetime-api-key",
            validators: { required: true },
          },
        } satisfies DateTimeConfig);
      });

      it("can generate a non-required datetime field", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "Non-Required DateTime",
            api_key: "non-required-datetime-api-key",
          }),
        });

        expect(dateTimeGenerator.generateBuildConfig()).toEqual({
          label: "Non-Required DateTime",
          body: {
            api_key: "non-required-datetime-api-key",
          },
        } satisfies DateTimeConfig);
      });
    });

    describe("DateTime Range", () => {
      it("can generate a datetime field with a range", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "DateTime with Range",
            api_key: "datetime-with-range-api-key",
            validators: {
              date_time_range: {
                min: "2025-07-03T05:00:00+01:00",
                max: "2025-07-12T05:00:00+01:00",
              },
            },
          }),
        });

        const config = dateTimeGenerator.generateBuildConfig();

        expect(config.label).toBe("DateTime with Range");
        expect(config.body?.api_key).toBe("datetime-with-range-api-key");
        expect(config.body?.validators?.date_time_range?.min).toBeInstanceOf(
          Date,
        );
        expect(config.body?.validators?.date_time_range?.max).toBeInstanceOf(
          Date,
        );
        expect(config.body?.validators?.date_time_range?.min).toEqual(
          new Date("2025-07-03T05:00:00+01:00"),
        );
        expect(config.body?.validators?.date_time_range?.max).toEqual(
          new Date("2025-07-12T05:00:00+01:00"),
        );
      });

      it("generates method call with new Date() constructor calls", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "DateTime with Range",
            api_key: "datetime-with-range-api-key",
            validators: {
              date_time_range: {
                min: "2025-07-03T05:00:00+01:00",
                max: "2025-07-12T05:00:00+01:00",
              },
            },
          }),
        });

        const methodCall = dateTimeGenerator.generateMethodCall();

        expect(methodCall).toContain('new Date("2025-07-03T05:00:00+01:00")');
        expect(methodCall).toContain('new Date("2025-07-12T05:00:00+01:00")');
        expect(methodCall).toMatch(/\.addDateTime\(/);
      });

      it("can generate a datetime field with a minimum datetime", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "DateTime with Min",
            api_key: "datetime-with-min-api-key",
            validators: {
              date_time_range: { min: "2025-07-03T05:00:00+01:00" },
            },
          }),
        });

        const config = dateTimeGenerator.generateBuildConfig();

        expect(config.label).toBe("DateTime with Min");
        expect(config.body?.api_key).toBe("datetime-with-min-api-key");
        expect(config.body?.validators?.date_time_range?.min).toBeInstanceOf(
          Date,
        );
        expect(config.body?.validators?.date_time_range?.min).toEqual(
          new Date("2025-07-03T05:00:00+01:00"),
        );
      });

      it("can generate a datetime field with a maximum datetime", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "DateTime with Max",
            api_key: "datetime-with-max-api-key",
            validators: {
              date_time_range: { max: "2025-07-12T05:00:00+01:00" },
            },
          }),
        });

        const config = dateTimeGenerator.generateBuildConfig();

        expect(config.label).toBe("DateTime with Max");
        expect(config.body?.api_key).toBe("datetime-with-max-api-key");
        expect(config.body?.validators?.date_time_range?.max).toBeInstanceOf(
          Date,
        );
        expect(config.body?.validators?.date_time_range?.max).toEqual(
          new Date("2025-07-12T05:00:00+01:00"),
        );
      });

      it("preserves original format for timezone-aware datetime strings", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "DateTime Format Test",
            api_key: "datetime-format-test",
            validators: {
              date_time_range: {
                min: "2025-07-03T05:00:00+01:00",
                max: "2025-07-12T05:00:00+01:00",
              },
            },
          }),
        });

        const methodCall = dateTimeGenerator.generateMethodCall();

        expect(methodCall).toContain('new Date("2025-07-03T05:00:00+01:00")');
        expect(methodCall).toContain('new Date("2025-07-12T05:00:00+01:00")');
      });

      it("preserves UTC format for UTC datetime strings", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "UTC DateTime Test",
            api_key: "utc-datetime-test",
            validators: {
              date_time_range: {
                min: "2025-07-03T04:00:00.000Z",
                max: "2025-07-12T04:00:00.000Z",
              },
            },
          }),
        });

        const methodCall = dateTimeGenerator.generateMethodCall();

        expect(methodCall).toContain('new Date("2025-07-03T04:00:00.000Z")');
        expect(methodCall).toContain('new Date("2025-07-12T04:00:00.000Z")');
      });

      it("handles mixed timezone formats", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "Mixed Timezone Test",
            api_key: "mixed-timezone-test",
            validators: {
              date_time_range: {
                min: "2025-07-03T05:00:00+01:00",
                max: "2025-07-12T04:00:00.000Z",
              },
            },
          }),
        });

        const methodCall = dateTimeGenerator.generateMethodCall();

        expect(methodCall).toContain('new Date("2025-07-03T05:00:00+01:00")');
        expect(methodCall).toContain('new Date("2025-07-12T04:00:00.000Z")');
      });

      it("handles edge case datetime formats", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "Edge Case DateTimes",
            api_key: "edge-case-datetimes",
            validators: {
              date_time_range: {
                min: "1970-01-01T00:00:00.000Z",
                max: "2099-12-31T23:59:59.999Z",
              },
            },
          }),
        });

        const config = dateTimeGenerator.generateBuildConfig();

        expect(config.body?.validators?.date_time_range?.min).toBeInstanceOf(
          Date,
        );
        expect(config.body?.validators?.date_time_range?.max).toBeInstanceOf(
          Date,
        );
        expect(
          (config.body?.validators?.date_time_range?.min as Date)
            ?.toISOString()
            .startsWith("1970"),
        ).toBe(true);
        expect(
          (
            config.body?.validators?.date_time_range?.max as Date
          )?.getFullYear(),
        ).toBe(2099);
      });
    });

    describe("Combined validators", () => {
      it("can generate a datetime field with both required and range validators", () => {
        const dateTimeGenerator = new DateTimeFieldGenerator({
          field: createMockField({
            label: "Required DateTime with Range",
            api_key: "required-datetime-with-range",
            validators: {
              required: {},
              date_time_range: {
                min: "2025-07-03T05:00:00+01:00",
                max: "2025-07-12T05:00:00+01:00",
              },
            },
          }),
        });

        const config = dateTimeGenerator.generateBuildConfig();

        expect(config.label).toBe("Required DateTime with Range");
        expect(config.body?.api_key).toBe("required-datetime-with-range");
        expect(config.body?.validators?.required).toBe(true);
        expect(config.body?.validators?.date_time_range?.min).toBeInstanceOf(
          Date,
        );
        expect(config.body?.validators?.date_time_range?.max).toBeInstanceOf(
          Date,
        );
      });
    });
  });

  describe("Real-world API response test", () => {
    it("can handle the exact API response from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "OXMgB7PNRK6mTuG6EKjPeA",
        type: "field",
        label: "Date time",
        field_type: "date_time",
        api_key: "date_time",
        hint: "dfggdfs",
        localized: false,
        validators: {
          required: {},
          date_time_range: {
            min: "2025-07-03T05:00:00+01:00",
            max: "2025-07-12T05:00:00+01:00",
          },
        },
        position: 2,
        appearance: { addons: [], editor: "date_time_picker", parameters: {} },
        default_value: "2025-07-10T05:00:00+01:00",
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const dateTimeGenerator = new DateTimeFieldGenerator({
        field: apiResponseField,
      });

      const config = dateTimeGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Date time",
        body: {
          api_key: "date_time",
          hint: "dfggdfs",
          default_value: "2025-07-10T05:00:00+01:00",
          validators: {
            required: true,
            date_time_range: {
              min: new Date("2025-07-03T05:00:00+01:00"),
              max: new Date("2025-07-12T05:00:00+01:00"),
            },
          },
        },
      } satisfies DateTimeConfig);
    });
  });
});
