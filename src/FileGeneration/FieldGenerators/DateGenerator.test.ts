import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { DateConfig } from "@/Fields/Date";
import { DateGenerator } from "@/FileGeneration/FieldGenerators/DateGenerator";

describe("DateGenerator", () => {
  it("can generate a date with basic properties", () => {
    const mockField: Field = {
      id: "test-id",
      type: "field",
      label: "Date",
      field_type: "date",
      api_key: "test-date-api-key",
      hint: "test hint",
      localized: false,
      validators: {},
      position: 1,
      appearance: { addons: [], editor: "date_picker", parameters: {} },
      default_value: "2025-07-24",
      deep_filtering_enabled: false,
      item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
      fieldset: null,
    };

    const dateGenerator = new DateGenerator({
      field: mockField,
      needsAsync: false,
      itemTypeReferences: new Map(),
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
        const mockField: Field = {
          id: "test-id",
          type: "field",
          label: "Required Date",
          field_type: "date",
          api_key: "required-date-api-key",
          hint: "test hint",
          localized: false,
          validators: { required: {} },
          position: 1,
          appearance: { addons: [], editor: "date_picker", parameters: {} },
          default_value: null,
          deep_filtering_enabled: false,
          item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
          fieldset: null,
        };

        const dateGenerator = new DateGenerator({
          field: mockField,
          needsAsync: false,
          itemTypeReferences: new Map(),
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
        const mockField: Field = {
          id: "test-id",
          type: "field",
          label: "Non-Required Date",
          field_type: "date",
          api_key: "non-required-date-api-key",
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

        const dateGenerator = new DateGenerator({
          field: mockField,
          needsAsync: false,
          itemTypeReferences: new Map(),
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
        const mockField: Field = {
          id: "test-id",
          type: "field",
          label: "Date with Range",
          field_type: "date",
          api_key: "date-with-range-api-key",
          hint: "test hint",
          localized: false,
          validators: { range: { min: "2020-01-01", max: "2025-12-31" } },
          position: 1,
          appearance: { addons: [], editor: "date_picker", parameters: {} },
          default_value: null,
          deep_filtering_enabled: false,
          item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
          fieldset: null,
        };

        const dateGenerator = new DateGenerator({
          field: mockField,
          needsAsync: false,
          itemTypeReferences: new Map(),
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
        const mockField: Field = {
          id: "test-id",
          type: "field",
          label: "Date with Min",
          field_type: "date",
          api_key: "date-with-min-api-key",
          hint: "test hint",
          localized: false,
          validators: { min_date: "2020-01-01" },
          position: 1,
          appearance: { addons: [], editor: "date_picker", parameters: {} },
          default_value: null,
          deep_filtering_enabled: false,
          item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
          fieldset: null,
        };

        const dateGenerator = new DateGenerator({
          field: mockField,
          needsAsync: false,
          itemTypeReferences: new Map(),
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
        const mockField: Field = {
          id: "test-id",
          type: "field",
          label: "Date with Max",
          field_type: "date",
          api_key: "date-with-max-api-key",
          hint: "test hint",
          localized: false,
          validators: { max_date: "2025-12-31" },
          position: 1,
          appearance: { addons: [], editor: "date_picker", parameters: {} },
          default_value: null,
          deep_filtering_enabled: false,
          item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
          fieldset: null,
        };

        const dateGenerator = new DateGenerator({
          field: mockField,
          needsAsync: false,
          itemTypeReferences: new Map(),
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
      const mockField: Field = {
        id: "test-id",
        type: "field",
        label: "Date with Default",
        field_type: "date",
        api_key: "date-with-default-api-key",
        hint: "test hint",
        localized: false,
        validators: {},
        position: 1,
        appearance: { addons: [], editor: "date_picker", parameters: {} },
        default_value: "2025-07-24",
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const dateGenerator = new DateGenerator({
        field: mockField,
        needsAsync: false,
        itemTypeReferences: new Map(),
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
      const mockField: Field = {
        id: "test-id",
        type: "field",
        label: "Date without Default",
        field_type: "date",
        api_key: "date-without-default-api-key",
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

      const dateGenerator = new DateGenerator({
        field: mockField,
        needsAsync: false,
        itemTypeReferences: new Map(),
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
