import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { SlugConfig } from "@/Fields/Slug";
import { SlugFieldGenerator } from "@/FileGeneration/FieldGenerators/SlugFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "slug",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: {
      addons: [],
      editor: "slug",
      parameters: {
        url_prefix: "",
        placeholder: "",
      },
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("SlugFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate a slug field with label", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "URL Slug",
          api_key: "url_slug",
        }),
      });

      expect(slugGenerator.generateBuildConfig()).toEqual({
        label: "URL Slug",
        url_prefix: "",
        placeholder: "",
        body: {
          api_key: "url_slug",
        },
      } satisfies SlugConfig);
    });

    it("does not include position", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug without Position",
          api_key: "slug_without_position",
        }),
      });

      expect(slugGenerator.generateBuildConfig()).toEqual({
        label: "Slug without Position",
        url_prefix: "",
        placeholder: "",
        body: {
          api_key: "slug_without_position",
        },
      } satisfies SlugConfig);
    });

    it("can generate a slug field with a hint", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug with Hint",
          api_key: "slug_with_hint",
          hint: "URL-friendly slug",
        }),
      });

      expect(slugGenerator.generateBuildConfig()).toEqual({
        label: "Slug with Hint",
        url_prefix: "",
        placeholder: "",
        body: {
          api_key: "slug_with_hint",
          hint: "URL-friendly slug",
        },
      } satisfies SlugConfig);
    });

    it("can generate a slug field without a hint", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug without Hint",
          api_key: "slug_without_hint",
          hint: null,
        }),
      });

      expect(slugGenerator.generateBuildConfig()).toEqual({
        label: "Slug without Hint",
        url_prefix: "",
        placeholder: "",
        body: {
          api_key: "slug_without_hint",
        },
      } satisfies SlugConfig);
    });

    it("should not include validators if none are set", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug without Validators",
          api_key: "slug_without_validators",
          validators: {},
        }),
      });

      expect(slugGenerator.generateBuildConfig()).toEqual({
        label: "Slug without Validators",
        url_prefix: "",
        placeholder: "",
        body: {
          api_key: "slug_without_validators",
        },
      } satisfies SlugConfig);
    });
  });

  describe("Appearance parameters", () => {
    it("can extract url_prefix parameter", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug with URL Prefix",
          api_key: "slug_with_prefix",
          appearance: {
            addons: [],
            editor: "slug",
            parameters: {
              url_prefix: "https://example.com/",
              placeholder: "",
            },
          },
        }),
      });

      expect(slugGenerator.generateBuildConfig()).toEqual({
        label: "Slug with URL Prefix",
        url_prefix: "https://example.com/",
        placeholder: "",
        body: {
          api_key: "slug_with_prefix",
        },
      } satisfies SlugConfig);
    });

    it("can extract placeholder parameter", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug with Placeholder",
          api_key: "slug_with_placeholder",
          appearance: {
            addons: [],
            editor: "slug",
            parameters: {
              url_prefix: "",
              placeholder: "my-awesome-post",
            },
          },
        }),
      });

      expect(slugGenerator.generateBuildConfig()).toEqual({
        label: "Slug with Placeholder",
        url_prefix: "",
        placeholder: "my-awesome-post",
        body: {
          api_key: "slug_with_placeholder",
        },
      } satisfies SlugConfig);
    });

    it("can handle both url_prefix and placeholder", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Full Slug Config",
          api_key: "full_slug_config",
          appearance: {
            addons: [],
            editor: "slug",
            parameters: {
              url_prefix: "https://blog.example.com/posts/",
              placeholder: "post-title-here",
            },
          },
        }),
      });

      expect(slugGenerator.generateBuildConfig()).toEqual({
        label: "Full Slug Config",
        url_prefix: "https://blog.example.com/posts/",
        placeholder: "post-title-here",
        body: {
          api_key: "full_slug_config",
        },
      } satisfies SlugConfig);
    });

    it("handles missing appearance parameters gracefully", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug No Params",
          api_key: "slug_no_params",
          appearance: {
            addons: [],
            editor: "slug",
            parameters: {},
          },
        }),
      });

      expect(slugGenerator.generateBuildConfig()).toEqual({
        label: "Slug No Params",
        body: {
          api_key: "slug_no_params",
        },
      } satisfies SlugConfig);
    });
  });

  describe("With validators", () => {
    describe("Required", () => {
      it("can generate a required slug field", () => {
        const slugGenerator = new SlugFieldGenerator({
          field: createMockField({
            label: "Required Slug",
            api_key: "required_slug",
            validators: { required: {} },
          }),
        });

        expect(slugGenerator.generateBuildConfig()).toEqual({
          label: "Required Slug",
          url_prefix: "",
          placeholder: "",
          body: {
            api_key: "required_slug",
            validators: { required: true },
          },
        } satisfies SlugConfig);
      });

      it("can generate a non-required slug field", () => {
        const slugGenerator = new SlugFieldGenerator({
          field: createMockField({
            label: "Non-Required Slug",
            api_key: "non_required_slug",
          }),
        });

        expect(slugGenerator.generateBuildConfig()).toEqual({
          label: "Non-Required Slug",
          url_prefix: "",
          placeholder: "",
          body: {
            api_key: "non_required_slug",
          },
        } satisfies SlugConfig);
      });
    });

    describe("Slug-specific validators", () => {
      it("can generate a slug field with length validator", () => {
        const slugGenerator = new SlugFieldGenerator({
          field: createMockField({
            label: "Slug with Length",
            api_key: "slug_with_length",
            validators: {
              length: { min: 5, max: 50 },
            },
          }),
        });

        expect(slugGenerator.generateBuildConfig()).toEqual({
          label: "Slug with Length",
          url_prefix: "",
          placeholder: "",
          body: {
            api_key: "slug_with_length",
            validators: {
              length: { min: 5, max: 50 },
            },
          },
        } satisfies SlugConfig);
      });

      it("can generate a slug field with slug_format validator", () => {
        const slugGenerator = new SlugFieldGenerator({
          field: createMockField({
            label: "Slug with Format",
            api_key: "slug_with_format",
            validators: {
              slug_format: { predefined_pattern: "webpage_slug" },
            },
          }),
        });

        expect(slugGenerator.generateBuildConfig()).toEqual({
          label: "Slug with Format",
          url_prefix: "",
          placeholder: "",
          body: {
            api_key: "slug_with_format",
            validators: {
              slug_format: { predefined_pattern: "webpage_slug" },
            },
          },
        } satisfies SlugConfig);
      });

      it("can generate a slug field with slug_title_field validator", () => {
        const slugGenerator = new SlugFieldGenerator({
          field: createMockField({
            label: "Slug with Title Field",
            api_key: "slug_with_title_field",
            validators: {
              slug_title_field: { title_field_id: "title_field_123" },
            },
          }),
        });

        expect(slugGenerator.generateBuildConfig()).toEqual({
          label: "Slug with Title Field",
          url_prefix: "",
          placeholder: "",
          body: {
            api_key: "slug_with_title_field",
            validators: {
              slug_title_field: { title_field_id: "title_field_123" },
            },
          },
        } satisfies SlugConfig);
      });

      it("can generate a slug field with multiple validators", () => {
        const slugGenerator = new SlugFieldGenerator({
          field: createMockField({
            label: "Slug with Multiple Validators",
            api_key: "slug_multiple_validators",
            validators: {
              required: {},
              length: { min: 3, max: 100 },
              slug_format: { predefined_pattern: "webpage_slug" },
            },
          }),
        });

        expect(slugGenerator.generateBuildConfig()).toEqual({
          label: "Slug with Multiple Validators",
          url_prefix: "",
          placeholder: "",
          body: {
            api_key: "slug_multiple_validators",
            validators: {
              required: true,
              length: { min: 3, max: 100 },
              slug_format: { predefined_pattern: "webpage_slug" },
            },
          },
        } satisfies SlugConfig);
      });
    });
  });

  describe("Method call generation", () => {
    it("generates method call with correct method name", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Test Slug",
          api_key: "test_slug",
        }),
      });

      const methodCall = slugGenerator.generateMethodCall();

      expect(methodCall).toMatch(/\.addSlug\(/);
      expect(methodCall).toContain('"Test Slug"');
      expect(methodCall).toContain('"test_slug"');
    });

    it("generates method call with appearance parameters", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug with Params",
          api_key: "slug_with_params",
          appearance: {
            addons: [],
            editor: "slug",
            parameters: {
              url_prefix: "https://example.com/",
              placeholder: "post-slug",
            },
          },
        }),
      });

      const methodCall = slugGenerator.generateMethodCall();

      expect(methodCall).toContain('url_prefix: "https://example.com/"');
      expect(methodCall).toContain('placeholder: "post-slug"');
      expect(methodCall).toMatch(/\.addSlug\(/);
    });

    it("generates method call with validators", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug with Validators",
          api_key: "slug_with_validators",
          validators: {
            length: { min: 5, max: 50 },
          },
        }),
      });

      const methodCall = slugGenerator.generateMethodCall();

      expect(methodCall).toContain("length");
      expect(methodCall).toMatch(/\.addSlug\(/);
    });

    it("generates method call with hint", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Slug with Hint",
          api_key: "slug_with_hint",
          hint: "Enter URL slug",
        }),
      });

      const methodCall = slugGenerator.generateMethodCall();

      expect(methodCall).toContain('"Enter URL slug"');
      expect(methodCall).toMatch(/\.addSlug\(/);
    });
  });

  describe("Real-world API response test", () => {
    it("can handle a realistic Slug field from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "slug-field-123",
        type: "field",
        label: "Post Slug",
        field_type: "slug",
        api_key: "post_slug",
        hint: "URL-friendly version of the title",
        localized: false,
        validators: {
          required: {},
          length: { min: 3, max: 100 },
          slug_format: { predefined_pattern: "webpage_slug" },
        },
        position: 1,
        appearance: {
          addons: [],
          editor: "slug",
          parameters: {
            url_prefix: "https://blog.example.com/posts/",
            placeholder: "my-awesome-post",
          },
        },
        default_value: null,
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const slugGenerator = new SlugFieldGenerator({
        field: apiResponseField,
      });

      const config = slugGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Post Slug",
        url_prefix: "https://blog.example.com/posts/",
        placeholder: "my-awesome-post",
        body: {
          api_key: "post_slug",
          hint: "URL-friendly version of the title",
          validators: {
            required: true,
            length: { min: 3, max: 100 },
            slug_format: { predefined_pattern: "webpage_slug" },
          },
        },
      } satisfies SlugConfig);
    });
  });

  describe("getMethodCallName", () => {
    it("returns the correct method name", () => {
      const slugGenerator = new SlugFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(slugGenerator.getMethodCallName()).toBe("addSlug");
    });
  });
});
