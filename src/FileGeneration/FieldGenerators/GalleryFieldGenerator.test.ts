import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { AssetGalleryConfig } from "@/Fields/AssetGallery";
import { GalleryFieldGenerator } from "@/FileGeneration/FieldGenerators/GalleryFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "gallery",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: {
      addons: [],
      editor: "gallery",
      parameters: {},
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("GalleryFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a gallery field with label", () => {
      const galleryGenerator = new GalleryFieldGenerator({
        field: createMockField({
          label: "Image Gallery",
          api_key: "image_gallery",
        }),
      });

      expect(galleryGenerator.generateBuildConfig()).toEqual({
        label: "Image Gallery",
        body: {
          api_key: "image_gallery",
        },
      } satisfies AssetGalleryConfig);
    });

    it("does not include position", () => {
      const galleryGenerator = new GalleryFieldGenerator({
        field: createMockField({
          label: "Gallery without Position",
          api_key: "gallery_without_position",
        }),
      });

      expect(galleryGenerator.generateBuildConfig()).toEqual({
        label: "Gallery without Position",
        body: {
          api_key: "gallery_without_position",
        },
      } satisfies AssetGalleryConfig);
    });

    it("can generate a gallery field with a hint", () => {
      const galleryGenerator = new GalleryFieldGenerator({
        field: createMockField({
          label: "Gallery with Hint",
          api_key: "gallery_with_hint",
          hint: "Upload multiple images for the gallery",
        }),
      });

      expect(galleryGenerator.generateBuildConfig()).toEqual({
        label: "Gallery with Hint",
        body: {
          api_key: "gallery_with_hint",
          hint: "Upload multiple images for the gallery",
        },
      } satisfies AssetGalleryConfig);
    });

    it("can generate a gallery field without a hint", () => {
      const galleryGenerator = new GalleryFieldGenerator({
        field: createMockField({
          label: "Gallery without Hint",
          api_key: "gallery_without_hint",
          hint: null,
        }),
      });

      expect(galleryGenerator.generateBuildConfig()).toEqual({
        label: "Gallery without Hint",
        body: {
          api_key: "gallery_without_hint",
        },
      } satisfies AssetGalleryConfig);
    });

    it("should not include validators if none are set", () => {
      const galleryGenerator = new GalleryFieldGenerator({
        field: createMockField({
          label: "Gallery without Validators",
          api_key: "gallery_without_validators",
          validators: {},
        }),
      });

      expect(galleryGenerator.generateBuildConfig()).toEqual({
        label: "Gallery without Validators",
        body: {
          api_key: "gallery_without_validators",
        },
      } satisfies AssetGalleryConfig);
    });
  });

  describe("With validators", () => {
    describe("Gallery-specific validators", () => {
      it("can generate a gallery field with size validator", () => {
        const galleryGenerator = new GalleryFieldGenerator({
          field: createMockField({
            label: "Gallery with Size",
            api_key: "gallery_with_size",
            validators: {
              size: { min: 1, max: 10 },
            },
          }),
        });

        expect(galleryGenerator.generateBuildConfig()).toEqual({
          label: "Gallery with Size",
          body: {
            api_key: "gallery_with_size",
            validators: {
              size: { min: 1, max: 10 },
            },
          },
        } satisfies AssetGalleryConfig);
      });

      it("can generate a gallery field with file_size validator", () => {
        const galleryGenerator = new GalleryFieldGenerator({
          field: createMockField({
            label: "Gallery with File Size",
            api_key: "gallery_with_file_size",
            validators: {
              file_size: { max_value: 5, max_unit: "MB" },
            },
          }),
        });

        expect(galleryGenerator.generateBuildConfig()).toEqual({
          label: "Gallery with File Size",
          body: {
            api_key: "gallery_with_file_size",
            validators: {
              file_size: { max_value: 5, max_unit: "MB" },
            },
          },
        } satisfies AssetGalleryConfig);
      });

      it("can generate a gallery field with image_dimensions validator", () => {
        const galleryGenerator = new GalleryFieldGenerator({
          field: createMockField({
            label: "Gallery with Image Dimensions",
            api_key: "gallery_with_dimensions",
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

        expect(galleryGenerator.generateBuildConfig()).toEqual({
          label: "Gallery with Image Dimensions",
          body: {
            api_key: "gallery_with_dimensions",
            validators: {
              image_dimensions: {
                width_min_value: 100,
                width_max_value: 1920,
                height_min_value: 100,
                height_max_value: 1080,
              },
            },
          },
        } satisfies AssetGalleryConfig);
      });

      it("can generate a gallery field with image_aspect_ratio validator", () => {
        const galleryGenerator = new GalleryFieldGenerator({
          field: createMockField({
            label: "Gallery with Aspect Ratio",
            api_key: "gallery_with_aspect_ratio",
            validators: {
              image_aspect_ratio: { eq_ar_numerator: 16, eq_ar_denominator: 9 },
            },
          }),
        });

        expect(galleryGenerator.generateBuildConfig()).toEqual({
          label: "Gallery with Aspect Ratio",
          body: {
            api_key: "gallery_with_aspect_ratio",
            validators: {
              image_aspect_ratio: { eq_ar_numerator: 16, eq_ar_denominator: 9 },
            },
          },
        } satisfies AssetGalleryConfig);
      });

      it("can generate a gallery field with extension validator", () => {
        const galleryGenerator = new GalleryFieldGenerator({
          field: createMockField({
            label: "Gallery with Extensions",
            api_key: "gallery_with_extensions",
            validators: {
              extension: { predefined_list: "image" },
            },
          }),
        });

        expect(galleryGenerator.generateBuildConfig()).toEqual({
          label: "Gallery with Extensions",
          body: {
            api_key: "gallery_with_extensions",
            validators: {
              extension: { predefined_list: "image" },
            },
          },
        } satisfies AssetGalleryConfig);
      });

      it("can generate a gallery field with required_alt_title validator", () => {
        const galleryGenerator = new GalleryFieldGenerator({
          field: createMockField({
            label: "Gallery with Alt Title",
            api_key: "gallery_with_alt_title",
            validators: {
              required_alt_title: { title: true, alt: true },
            },
          }),
        });

        expect(galleryGenerator.generateBuildConfig()).toEqual({
          label: "Gallery with Alt Title",
          body: {
            api_key: "gallery_with_alt_title",
            validators: {
              required_alt_title: { title: true, alt: true },
            },
          },
        } satisfies AssetGalleryConfig);
      });

      it("can generate a gallery field with multiple validators", () => {
        const galleryGenerator = new GalleryFieldGenerator({
          field: createMockField({
            label: "Gallery with Multiple Validators",
            api_key: "gallery_multiple_validators",
            validators: {
              size: { min: 1, max: 5 },
              file_size: { max_value: 10, max_unit: "MB" },
              extension: { predefined_list: "image" },
            },
          }),
        });

        expect(galleryGenerator.generateBuildConfig()).toEqual({
          label: "Gallery with Multiple Validators",
          body: {
            api_key: "gallery_multiple_validators",
            validators: {
              size: { min: 1, max: 5 },
              file_size: { max_value: 10, max_unit: "MB" },
              extension: { predefined_list: "image" },
            },
          },
        } satisfies AssetGalleryConfig);
      });
    });
  });

  describe("Method call generation", () => {
    it("generates method call with correct method name", () => {
      const galleryGenerator = new GalleryFieldGenerator({
        field: createMockField({
          label: "Test Gallery",
          api_key: "test_gallery",
        }),
      });

      const methodCall = galleryGenerator.generateMethodCall();

      expect(methodCall).toMatch(/\.addAssetGallery\(/);
      expect(methodCall).toContain('"Test Gallery"');
      expect(methodCall).toContain('"test_gallery"');
    });

    it("generates method call with validators", () => {
      const galleryGenerator = new GalleryFieldGenerator({
        field: createMockField({
          label: "Gallery with Validators",
          api_key: "gallery_with_validators",
          validators: {
            size: { min: 1, max: 10 },
          },
        }),
      });

      const methodCall = galleryGenerator.generateMethodCall();

      expect(methodCall).toContain("size");
      expect(methodCall).toMatch(/\.addAssetGallery\(/);
    });

    it("generates method call with hint", () => {
      const galleryGenerator = new GalleryFieldGenerator({
        field: createMockField({
          label: "Gallery with Hint",
          api_key: "gallery_with_hint",
          hint: "Upload images here",
        }),
      });

      const methodCall = galleryGenerator.generateMethodCall();

      expect(methodCall).toContain('"Upload images here"');
      expect(methodCall).toMatch(/\.addAssetGallery\(/);
    });
  });

  describe("Real-world API response test", () => {
    it("can handle a realistic Gallery field from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "gallery-field-123",
        type: "field",
        label: "Image Gallery",
        field_type: "gallery",
        api_key: "image_gallery",
        hint: "Upload multiple images for the gallery",
        localized: false,
        validators: {
          size: { min: 1, max: 10 },
          file_size: { max_value: 5, max_unit: "MB" },
          extension: { predefined_list: "image" },
          required_alt_title: { title: true, alt: false },
        },
        position: 1,
        appearance: {
          addons: [],
          editor: "gallery",
          parameters: {},
        },
        default_value: null,
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const galleryGenerator = new GalleryFieldGenerator({
        field: apiResponseField,
      });

      const config = galleryGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Image Gallery",
        body: {
          api_key: "image_gallery",
          hint: "Upload multiple images for the gallery",
          validators: {
            size: { min: 1, max: 10 },
            file_size: { max_value: 5, max_unit: "MB" },
            extension: { predefined_list: "image" },
            required_alt_title: { title: true, alt: false },
          },
        },
      } satisfies AssetGalleryConfig);
    });
  });

  describe("getMethodCallName", () => {
    it("returns the correct method name", () => {
      const galleryGenerator = new GalleryFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(galleryGenerator.getMethodCallName()).toBe("addAssetGallery");
    });
  });
});
