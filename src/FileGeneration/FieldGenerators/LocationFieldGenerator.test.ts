import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { LocationConfig } from "@/Fields/Location";
import { LocationFieldGenerator } from "@/FileGeneration/FieldGenerators/LocationFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "lat_lon",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: { addons: [], editor: "map", parameters: {} },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("LocationFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a location with label", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Location",
          api_key: "location",
        }),
      });

      expect(locationGenerator.generateBuildConfig()).toEqual({
        label: "Location",
        body: {
          api_key: "location",
        },
      } satisfies LocationConfig);
    });

    it("does not include position", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Location without Position",
          api_key: "location_without_position",
        }),
      });

      expect(locationGenerator.generateBuildConfig()).toEqual({
        label: "Location without Position",
        body: {
          api_key: "location_without_position",
        },
      } satisfies LocationConfig);
    });

    it("can generate a location with a hint", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Location with Hint",
          api_key: "location_with_hint",
          hint: "Please enter the exact coordinates",
        }),
      });

      expect(locationGenerator.generateBuildConfig()).toEqual({
        label: "Location with Hint",
        body: {
          api_key: "location_with_hint",
          hint: "Please enter the exact coordinates",
        },
      } satisfies LocationConfig);
    });

    it("can generate a location without a hint", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Location without Hint",
          api_key: "location_without_hint",
          hint: null,
        }),
      });

      expect(locationGenerator.generateBuildConfig()).toEqual({
        label: "Location without Hint",
        body: {
          api_key: "location_without_hint",
        },
      } satisfies LocationConfig);
    });

    it("can generate a location with a default value", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Location with Default Value",
          api_key: "location_with_default_value",
          default_value: { latitude: 40.7128, longitude: -74.006 },
        }),
      });

      expect(locationGenerator.generateBuildConfig()).toEqual({
        label: "Location with Default Value",
        body: {
          api_key: "location_with_default_value",
          default_value: { latitude: 40.7128, longitude: -74.006 },
        },
      } satisfies LocationConfig);
    });

    it("can generate a location without a default value", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Location without Default Value",
          api_key: "location_without_default_value",
          default_value: null,
        }),
      });

      expect(locationGenerator.generateBuildConfig()).toEqual({
        label: "Location without Default Value",
        body: {
          api_key: "location_without_default_value",
        },
      } satisfies LocationConfig);
    });

    it("should not include validators if none are set", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Location without Validators",
          api_key: "location_without_validators",
          validators: {},
        }),
      });

      expect(locationGenerator.generateBuildConfig()).toEqual({
        label: "Location without Validators",
        body: {
          api_key: "location_without_validators",
        },
      } satisfies LocationConfig);
    });
  });

  describe("With validators", () => {
    describe("Required", () => {
      it("can generate a required location field", () => {
        const locationGenerator = new LocationFieldGenerator({
          field: createMockField({
            label: "Required Location",
            api_key: "required-location-api-key",
            validators: { required: {} },
          }),
        });

        expect(locationGenerator.generateBuildConfig()).toEqual({
          label: "Required Location",
          body: {
            api_key: "required-location-api-key",
            validators: { required: true },
          },
        } satisfies LocationConfig);
      });

      it("can generate a non-required location field", () => {
        const locationGenerator = new LocationFieldGenerator({
          field: createMockField({
            label: "Non-Required Location",
            api_key: "non-required-location-api-key",
          }),
        });

        expect(locationGenerator.generateBuildConfig()).toEqual({
          label: "Non-Required Location",
          body: {
            api_key: "non-required-location-api-key",
          },
        } satisfies LocationConfig);
      });
    });
  });

  describe("Method call generation", () => {
    it("generates method call with correct method name", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Test Location",
          api_key: "test_location",
        }),
      });

      const methodCall = locationGenerator.generateMethodCall();

      expect(methodCall).toMatch(/\.addLocation\(/);
      expect(methodCall).toContain('"Test Location"');
      expect(methodCall).toContain('"test_location"');
    });

    it("generates method call with required validator", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Required Location",
          api_key: "required_location",
          validators: { required: {} },
        }),
      });

      const methodCall = locationGenerator.generateMethodCall();

      expect(methodCall).toContain("required: true");
      expect(methodCall).toMatch(/\.addLocation\(/);
    });

    it("generates method call with hint", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Location with Hint",
          api_key: "location_with_hint",
          hint: "Enter coordinates",
        }),
      });

      const methodCall = locationGenerator.generateMethodCall();

      expect(methodCall).toContain('"Enter coordinates"');
      expect(methodCall).toMatch(/\.addLocation\(/);
    });

    it("generates method call with default value", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Location with Default",
          api_key: "location_with_default",
          default_value: { latitude: 51.5074, longitude: -0.1278 },
        }),
      });

      const methodCall = locationGenerator.generateMethodCall();

      expect(methodCall).toContain("latitude: 51.5074");
      expect(methodCall).toContain("longitude: -0.1278");
      expect(methodCall).toMatch(/\.addLocation\(/);
    });
  });

  describe("Real-world API response test", () => {
    it("can handle a realistic Location field from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "location-field-123",
        type: "field",
        label: "Office Location",
        field_type: "lat_lon",
        api_key: "office_location",
        hint: "Please select the office location on the map",
        localized: false,
        validators: {
          required: {},
        },
        position: 3,
        appearance: { addons: [], editor: "map", parameters: {} },
        default_value: { latitude: 37.7749, longitude: -122.4194 },
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const locationGenerator = new LocationFieldGenerator({
        field: apiResponseField,
      });

      const config = locationGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Office Location",
        body: {
          api_key: "office_location",
          hint: "Please select the office location on the map",
          default_value: { latitude: 37.7749, longitude: -122.4194 },
          validators: {
            required: true,
          },
        },
      } satisfies LocationConfig);
    });
  });

  describe("getMethodCallName", () => {
    it("returns the correct method name", () => {
      const locationGenerator = new LocationFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(locationGenerator.getMethodCallName()).toBe("addLocation");
    });
  });
});
