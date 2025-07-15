import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { SingleAssetConfig } from "@/Fields/SingleAsset";
import { SingleAssetFieldGenerator } from "@/FileGeneration/FieldGenerators/SingleAssetFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "file",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: {
      addons: [],
      editor: "file",
      parameters: {},
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("SingleAssetFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a single asset field with label", () => {
      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: createMockField({
          label: "Document",
          api_key: "document",
        }),
      });

      expect(singleAssetGenerator.generateBuildConfig()).toEqual({
        label: "Document",
        body: {
          api_key: "document",
        },
      } satisfies SingleAssetConfig);
    });

    it("does not include position", () => {
      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: createMockField({
          label: "Asset without Position",
          api_key: "asset_without_position",
        }),
      });

      expect(singleAssetGenerator.generateBuildConfig()).toEqual({
        label: "Asset without Position",
        body: {
          api_key: "asset_without_position",
        },
      } satisfies SingleAssetConfig);
    });

    it("can generate a single asset field with a hint", () => {
      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: createMockField({
          label: "Asset with Hint",
          api_key: "asset_with_hint",
          hint: "Upload a file",
        }),
      });

      expect(singleAssetGenerator.generateBuildConfig()).toEqual({
        label: "Asset with Hint",
        body: {
          api_key: "asset_with_hint",
          hint: "Upload a file",
        },
      } satisfies SingleAssetConfig);
    });

    it("can generate a single asset field without a hint", () => {
      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: createMockField({
          label: "Asset without Hint",
          api_key: "asset_without_hint",
          hint: null,
        }),
      });

      expect(singleAssetGenerator.generateBuildConfig()).toEqual({
        label: "Asset without Hint",
        body: {
          api_key: "asset_without_hint",
        },
      } satisfies SingleAssetConfig);
    });

    it("should not include validators if none are set", () => {
      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: createMockField({
          label: "Asset without Validators",
          api_key: "asset_without_validators",
          validators: {},
        }),
      });

      expect(singleAssetGenerator.generateBuildConfig()).toEqual({
        label: "Asset without Validators",
        body: {
          api_key: "asset_without_validators",
        },
      } satisfies SingleAssetConfig);
    });
  });

  describe("With validators", () => {
    describe("Required", () => {
      it("can generate a required single asset field", () => {
        const singleAssetGenerator = new SingleAssetFieldGenerator({
          field: createMockField({
            label: "Required Asset",
            api_key: "required_asset",
            validators: { required: {} },
          }),
        });

        expect(singleAssetGenerator.generateBuildConfig()).toEqual({
          label: "Required Asset",
          body: {
            api_key: "required_asset",
            validators: { required: true },
          },
        } satisfies SingleAssetConfig);
      });

      it("can generate a non-required single asset field", () => {
        const singleAssetGenerator = new SingleAssetFieldGenerator({
          field: createMockField({
            label: "Non-Required Asset",
            api_key: "non_required_asset",
          }),
        });

        expect(singleAssetGenerator.generateBuildConfig()).toEqual({
          label: "Non-Required Asset",
          body: {
            api_key: "non_required_asset",
          },
        } satisfies SingleAssetConfig);
      });
    });

    describe("File-specific validators", () => {
      it("can generate a single asset field with file_size validator", () => {
        const singleAssetGenerator = new SingleAssetFieldGenerator({
          field: createMockField({
            label: "Asset with File Size",
            api_key: "asset_with_file_size",
            validators: {
              file_size: { max_value: 5, max_unit: "MB" },
            },
          }),
        });

        expect(singleAssetGenerator.generateBuildConfig()).toEqual({
          label: "Asset with File Size",
          body: {
            api_key: "asset_with_file_size",
            validators: {
              file_size: { max_value: 5, max_unit: "MB" },
            },
          },
        } satisfies SingleAssetConfig);
      });

      it("can generate a single asset field with image_dimensions validator", () => {
        const singleAssetGenerator = new SingleAssetFieldGenerator({
          field: createMockField({
            label: "Asset with Image Dimensions",
            api_key: "asset_with_dimensions",
            validators: {
              image_dimensions: {
                width_min_value: 100,
                width_max_value: 1920,
                height_min_value: 100,
                height_max_value: 1080,
              },
            },
          }),
        });

        expect(singleAssetGenerator.generateBuildConfig()).toEqual({
          label: "Asset with Image Dimensions",
          body: {
            api_key: "asset_with_dimensions",
            validators: {
              image_dimensions: {
                width_min_value: 100,
                width_max_value: 1920,
                height_min_value: 100,
                height_max_value: 1080,
              },
            },
          },
        } satisfies SingleAssetConfig);
      });

      it("can generate a single asset field with image_aspect_ratio validator", () => {
        const singleAssetGenerator = new SingleAssetFieldGenerator({
          field: createMockField({
            label: "Asset with Aspect Ratio",
            api_key: "asset_with_aspect_ratio",
            validators: {
              image_aspect_ratio: { eq_ar_numerator: 16, eq_ar_denominator: 9 },
            },
          }),
        });

        expect(singleAssetGenerator.generateBuildConfig()).toEqual({
          label: "Asset with Aspect Ratio",
          body: {
            api_key: "asset_with_aspect_ratio",
            validators: {
              image_aspect_ratio: { eq_ar_numerator: 16, eq_ar_denominator: 9 },
            },
          },
        } satisfies SingleAssetConfig);
      });

      it("can generate a single asset field with extension validator", () => {
        const singleAssetGenerator = new SingleAssetFieldGenerator({
          field: createMockField({
            label: "Asset with Extensions",
            api_key: "asset_with_extensions",
            validators: {
              extension: { predefined_list: "image" },
            },
          }),
        });

        expect(singleAssetGenerator.generateBuildConfig()).toEqual({
          label: "Asset with Extensions",
          body: {
            api_key: "asset_with_extensions",
            validators: {
              extension: { predefined_list: "image" },
            },
          },
        } satisfies SingleAssetConfig);
      });

      it("can generate a single asset field with required_alt_title validator", () => {
        const singleAssetGenerator = new SingleAssetFieldGenerator({
          field: createMockField({
            label: "Asset with Alt Title",
            api_key: "asset_with_alt_title",
            validators: {
              required_alt_title: { title: true, alt: true },
            },
          }),
        });

        expect(singleAssetGenerator.generateBuildConfig()).toEqual({
          label: "Asset with Alt Title",
          body: {
            api_key: "asset_with_alt_title",
            validators: {
              required_alt_title: { title: true, alt: true },
            },
          },
        } satisfies SingleAssetConfig);
      });

      it("can generate a single asset field with multiple validators", () => {
        const singleAssetGenerator = new SingleAssetFieldGenerator({
          field: createMockField({
            label: "Asset with Multiple Validators",
            api_key: "asset_multiple_validators",
            validators: {
              required: {},
              file_size: { max_value: 10, max_unit: "MB" },
              extension: { predefined_list: "image" },
            },
          }),
        });

        expect(singleAssetGenerator.generateBuildConfig()).toEqual({
          label: "Asset with Multiple Validators",
          body: {
            api_key: "asset_multiple_validators",
            validators: {
              required: true,
              file_size: { max_value: 10, max_unit: "MB" },
              extension: { predefined_list: "image" },
            },
          },
        } satisfies SingleAssetConfig);
      });
    });
  });

  describe("Method call generation", () => {
    it("generates method call with correct method name", () => {
      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: createMockField({
          label: "Test Asset",
          api_key: "test_asset",
        }),
      });

      const methodCall = singleAssetGenerator.generateMethodCall();

      expect(methodCall).toMatch(/\.addSingleAsset\(/);
      expect(methodCall).toContain('"Test Asset"');
      expect(methodCall).toContain('"test_asset"');
    });

    it("generates method call with validators", () => {
      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: createMockField({
          label: "Asset with Validators",
          api_key: "asset_with_validators",
          validators: {
            file_size: { max_value: 5, max_unit: "MB" },
          },
        }),
      });

      const methodCall = singleAssetGenerator.generateMethodCall();

      expect(methodCall).toContain("file_size");
      expect(methodCall).toMatch(/\.addSingleAsset\(/);
    });

    it("generates method call with hint", () => {
      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: createMockField({
          label: "Asset with Hint",
          api_key: "asset_with_hint",
          hint: "Upload document",
        }),
      });

      const methodCall = singleAssetGenerator.generateMethodCall();

      expect(methodCall).toContain('"Upload document"');
      expect(methodCall).toMatch(/\.addSingleAsset\(/);
    });
  });

  describe("Real-world API response test", () => {
    it("can handle a realistic Single Asset field from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "asset-field-123",
        type: "field",
        label: "Profile Image",
        field_type: "file",
        api_key: "profile_image",
        hint: "Upload profile picture",
        localized: false,
        validators: {
          required: {},
          file_size: { max_value: 2, max_unit: "MB" },
          extension: { predefined_list: "image" },
          required_alt_title: { title: false, alt: true },
        },
        position: 1,
        appearance: {
          addons: [],
          editor: "file",
          parameters: {},
        },
        default_value: null,
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: apiResponseField,
      });

      const config = singleAssetGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Profile Image",
        body: {
          api_key: "profile_image",
          hint: "Upload profile picture",
          validators: {
            required: true,
            file_size: { max_value: 2, max_unit: "MB" },
            extension: { predefined_list: "image" },
            required_alt_title: { title: false, alt: true },
          },
        },
      } satisfies SingleAssetConfig);
    });
  });

  describe("getMethodCallName", () => {
    it("returns the correct method name", () => {
      const singleAssetGenerator = new SingleAssetFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(singleAssetGenerator.getMethodCallName()).toBe("addSingleAsset");
    });
  });
});
