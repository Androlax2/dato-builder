import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { SeoConfig } from "@/Fields/Seo";
import { SeoFieldGenerator } from "@/FileGeneration/FieldGenerators/SeoFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "seo",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: {
      addons: [],
      editor: "seo",
      parameters: {
        fields: ["title", "description", "image", "no_index", "twitter_card"],
        previews: [
          "google",
          "twitter",
          "slack",
          "whatsapp",
          "telegram",
          "facebook",
          "linkedin",
        ],
      },
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("SeoFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate an SEO field with label", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "Page SEO",
          api_key: "page_seo",
        }),
      });

      expect(seoGenerator.generateBuildConfig()).toEqual({
        label: "Page SEO",
        fields: ["title", "description", "image", "no_index", "twitter_card"],
        previews: [
          "google",
          "twitter",
          "slack",
          "whatsapp",
          "telegram",
          "facebook",
          "linkedin",
        ],
        body: {
          api_key: "page_seo",
        },
      } satisfies SeoConfig);
    });

    it("does not include position", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "SEO without Position",
          api_key: "seo_without_position",
        }),
      });

      expect(seoGenerator.generateBuildConfig()).toEqual({
        label: "SEO without Position",
        fields: ["title", "description", "image", "no_index", "twitter_card"],
        previews: [
          "google",
          "twitter",
          "slack",
          "whatsapp",
          "telegram",
          "facebook",
          "linkedin",
        ],
        body: {
          api_key: "seo_without_position",
        },
      } satisfies SeoConfig);
    });

    it("can generate an SEO field with a hint", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "SEO with Hint",
          api_key: "seo_with_hint",
          hint: "Configure page SEO settings",
        }),
      });

      expect(seoGenerator.generateBuildConfig()).toEqual({
        label: "SEO with Hint",
        fields: ["title", "description", "image", "no_index", "twitter_card"],
        previews: [
          "google",
          "twitter",
          "slack",
          "whatsapp",
          "telegram",
          "facebook",
          "linkedin",
        ],
        body: {
          api_key: "seo_with_hint",
          hint: "Configure page SEO settings",
        },
      } satisfies SeoConfig);
    });

    it("can generate an SEO field without a hint", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "SEO without Hint",
          api_key: "seo_without_hint",
          hint: null,
        }),
      });

      expect(seoGenerator.generateBuildConfig()).toEqual({
        label: "SEO without Hint",
        fields: ["title", "description", "image", "no_index", "twitter_card"],
        previews: [
          "google",
          "twitter",
          "slack",
          "whatsapp",
          "telegram",
          "facebook",
          "linkedin",
        ],
        body: {
          api_key: "seo_without_hint",
        },
      } satisfies SeoConfig);
    });

    it("should not include validators if none are set", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "SEO without Validators",
          api_key: "seo_without_validators",
          validators: {},
        }),
      });

      expect(seoGenerator.generateBuildConfig()).toEqual({
        label: "SEO without Validators",
        fields: ["title", "description", "image", "no_index", "twitter_card"],
        previews: [
          "google",
          "twitter",
          "slack",
          "whatsapp",
          "telegram",
          "facebook",
          "linkedin",
        ],
        body: {
          api_key: "seo_without_validators",
        },
      } satisfies SeoConfig);
    });
  });

  describe("Appearance parameters", () => {
    it("can extract custom fields parameter", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "SEO with Custom Fields",
          api_key: "seo_custom_fields",
          appearance: {
            addons: [],
            editor: "seo",
            parameters: {
              fields: ["title", "description"],
              previews: ["google", "twitter"],
            },
          },
        }),
      });

      expect(seoGenerator.generateBuildConfig()).toEqual({
        label: "SEO with Custom Fields",
        fields: ["title", "description"],
        previews: ["google", "twitter"],
        body: {
          api_key: "seo_custom_fields",
        },
      } satisfies SeoConfig);
    });

    it("can extract custom previews parameter", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "SEO with Custom Previews",
          api_key: "seo_custom_previews",
          appearance: {
            addons: [],
            editor: "seo",
            parameters: {
              fields: ["title", "description", "image"],
              previews: ["google", "facebook"],
            },
          },
        }),
      });

      expect(seoGenerator.generateBuildConfig()).toEqual({
        label: "SEO with Custom Previews",
        fields: ["title", "description", "image"],
        previews: ["google", "facebook"],
        body: {
          api_key: "seo_custom_previews",
        },
      } satisfies SeoConfig);
    });

    it("handles missing appearance parameters gracefully", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "SEO No Params",
          api_key: "seo_no_params",
          appearance: {
            addons: [],
            editor: "seo",
            parameters: {},
          },
        }),
      });

      expect(seoGenerator.generateBuildConfig()).toEqual({
        label: "SEO No Params",
        body: {
          api_key: "seo_no_params",
        },
      } satisfies SeoConfig);
    });
  });

  describe("With validators", () => {
    describe("SEO-specific validators", () => {
      it("can generate an SEO field with required_seo_fields validator", () => {
        const seoGenerator = new SeoFieldGenerator({
          field: createMockField({
            label: "SEO with Required Fields",
            api_key: "seo_required_fields",
            validators: {
              required_seo_fields: {
                title: true,
                description: true,
              },
            },
          }),
        });

        expect(seoGenerator.generateBuildConfig()).toEqual({
          label: "SEO with Required Fields",
          fields: ["title", "description", "image", "no_index", "twitter_card"],
          previews: [
            "google",
            "twitter",
            "slack",
            "whatsapp",
            "telegram",
            "facebook",
            "linkedin",
          ],
          body: {
            api_key: "seo_required_fields",
            validators: {
              required_seo_fields: {
                title: true,
                description: true,
              },
            },
          },
        } satisfies SeoConfig);
      });

      it("can generate an SEO field with title_length validator", () => {
        const seoGenerator = new SeoFieldGenerator({
          field: createMockField({
            label: "SEO with Title Length",
            api_key: "seo_title_length",
            validators: {
              title_length: { min: 10, max: 60 },
            },
          }),
        });

        expect(seoGenerator.generateBuildConfig()).toEqual({
          label: "SEO with Title Length",
          fields: ["title", "description", "image", "no_index", "twitter_card"],
          previews: [
            "google",
            "twitter",
            "slack",
            "whatsapp",
            "telegram",
            "facebook",
            "linkedin",
          ],
          body: {
            api_key: "seo_title_length",
            validators: {
              title_length: { min: 10, max: 60 },
            },
          },
        } satisfies SeoConfig);
      });

      it("can generate an SEO field with description_length validator", () => {
        const seoGenerator = new SeoFieldGenerator({
          field: createMockField({
            label: "SEO with Description Length",
            api_key: "seo_description_length",
            validators: {
              description_length: { min: 120, max: 160 },
            },
          }),
        });

        expect(seoGenerator.generateBuildConfig()).toEqual({
          label: "SEO with Description Length",
          fields: ["title", "description", "image", "no_index", "twitter_card"],
          previews: [
            "google",
            "twitter",
            "slack",
            "whatsapp",
            "telegram",
            "facebook",
            "linkedin",
          ],
          body: {
            api_key: "seo_description_length",
            validators: {
              description_length: { min: 120, max: 160 },
            },
          },
        } satisfies SeoConfig);
      });

      it("can generate an SEO field with multiple validators", () => {
        const seoGenerator = new SeoFieldGenerator({
          field: createMockField({
            label: "SEO with Multiple Validators",
            api_key: "seo_multiple_validators",
            validators: {
              required_seo_fields: {
                title: true,
              },
              title_length: { min: 10, max: 60 },
              description_length: { min: 120, max: 160 },
            },
          }),
        });

        expect(seoGenerator.generateBuildConfig()).toEqual({
          label: "SEO with Multiple Validators",
          fields: ["title", "description", "image", "no_index", "twitter_card"],
          previews: [
            "google",
            "twitter",
            "slack",
            "whatsapp",
            "telegram",
            "facebook",
            "linkedin",
          ],
          body: {
            api_key: "seo_multiple_validators",
            validators: {
              required_seo_fields: {
                title: true,
              },
              title_length: { min: 10, max: 60 },
              description_length: { min: 120, max: 160 },
            },
          },
        } satisfies SeoConfig);
      });
    });
  });

  describe("Method call generation", () => {
    it("generates method call with correct method name", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "Test SEO",
          api_key: "test_seo",
        }),
      });

      const methodCall = seoGenerator.generateMethodCall();

      expect(methodCall).toMatch(/\.addSeo\(/);
      expect(methodCall).toContain('"Test SEO"');
      expect(methodCall).toContain('"test_seo"');
    });

    it("generates method call with custom fields", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "Custom Fields SEO",
          api_key: "custom_fields_seo",
          appearance: {
            addons: [],
            editor: "seo",
            parameters: {
              fields: ["title", "description"],
              previews: ["google", "twitter"],
            },
          },
        }),
      });

      const methodCall = seoGenerator.generateMethodCall();

      expect(methodCall).toContain('"title"');
      expect(methodCall).toContain('"description"');
      expect(methodCall).toMatch(/\.addSeo\(/);
    });

    it("generates method call with custom previews", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "Custom Previews SEO",
          api_key: "custom_previews_seo",
          appearance: {
            addons: [],
            editor: "seo",
            parameters: {
              fields: ["title", "description", "image"],
              previews: ["google", "facebook"],
            },
          },
        }),
      });

      const methodCall = seoGenerator.generateMethodCall();

      expect(methodCall).toContain('"google"');
      expect(methodCall).toContain('"facebook"');
      expect(methodCall).toMatch(/\.addSeo\(/);
    });

    it("generates method call with validators", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "SEO with Validators",
          api_key: "seo_with_validators",
          validators: {
            title_length: { min: 10, max: 60 },
          },
        }),
      });

      const methodCall = seoGenerator.generateMethodCall();

      expect(methodCall).toContain("title_length");
      expect(methodCall).toMatch(/\.addSeo\(/);
    });
  });

  describe("Real-world API response test", () => {
    it("can handle a realistic SEO field from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "seo-field-123",
        type: "field",
        label: "Page SEO",
        field_type: "seo",
        api_key: "page_seo",
        hint: "SEO settings for this page",
        localized: false,
        validators: {
          required_seo_fields: {
            title: true,
            description: true,
          },
          title_length: { min: 10, max: 60 },
        },
        position: 1,
        appearance: {
          addons: [],
          editor: "seo",
          parameters: {
            fields: [
              "title",
              "description",
              "image",
              "no_index",
              "twitter_card",
            ],
            previews: [
              "google",
              "twitter",
              "slack",
              "whatsapp",
              "telegram",
              "facebook",
              "linkedin",
            ],
          },
        },
        default_value: null,
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const seoGenerator = new SeoFieldGenerator({
        field: apiResponseField,
      });

      const config = seoGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Page SEO",
        fields: ["title", "description", "image", "no_index", "twitter_card"],
        previews: [
          "google",
          "twitter",
          "slack",
          "whatsapp",
          "telegram",
          "facebook",
          "linkedin",
        ],
        body: {
          api_key: "page_seo",
          hint: "SEO settings for this page",
          validators: {
            required_seo_fields: {
              title: true,
              description: true,
            },
            title_length: { min: 10, max: 60 },
          },
        },
      } satisfies SeoConfig);
    });
  });

  describe("getMethodCallName", () => {
    it("returns the correct method name", () => {
      const seoGenerator = new SeoFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(seoGenerator.getMethodCallName()).toBe("addSeo");
    });
  });
});
