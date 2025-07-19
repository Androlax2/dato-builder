import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { ExternalVideoConfig } from "@/Fields/ExternalVideo";
import { ExternalVideoFieldGenerator } from "@/FileGeneration/FieldGenerators/ExternalVideoFieldGenerator";

function createMockField(
  overrides: Partial<Field> & Pick<Field, "label" | "api_key">,
): Field {
  const defaults: Omit<Field, "label" | "api_key"> = {
    id: "test-id",
    type: "field",
    field_type: "video",
    hint: null,
    localized: false,
    position: 1,
    validators: {},
    appearance: {
      addons: [],
      editor: "video",
      parameters: {},
    },
    default_value: null,
    deep_filtering_enabled: false,
    item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
    fieldset: null,
  };

  return { ...defaults, ...overrides };
}

describe("ExternalVideoFieldGenerator", () => {
  describe("Basic functionality", () => {
    it("can generate an external video field with label", () => {
      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: createMockField({
          label: "Promotional Video",
          api_key: "promotional_video",
        }),
      });

      expect(externalVideoGenerator.generateBuildConfig()).toEqual({
        label: "Promotional Video",
        body: {
          api_key: "promotional_video",
        },
      } satisfies ExternalVideoConfig);
    });

    it("does not include position", () => {
      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: createMockField({
          label: "Video without Position",
          api_key: "video_without_position",
        }),
      });

      expect(externalVideoGenerator.generateBuildConfig()).toEqual({
        label: "Video without Position",
        body: {
          api_key: "video_without_position",
        },
      } satisfies ExternalVideoConfig);
    });

    it("can generate an external video field with a hint", () => {
      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: createMockField({
          label: "Video with Hint",
          api_key: "video_with_hint",
          hint: "Upload a video",
        }),
      });

      expect(externalVideoGenerator.generateBuildConfig()).toEqual({
        label: "Video with Hint",
        body: {
          api_key: "video_with_hint",
          hint: "Upload a video",
        },
      } satisfies ExternalVideoConfig);
    });

    it("can generate an external video field without a hint", () => {
      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: createMockField({
          label: "Video without Hint",
          api_key: "video_without_hint",
          hint: null,
        }),
      });

      expect(externalVideoGenerator.generateBuildConfig()).toEqual({
        label: "Video without Hint",
        body: {
          api_key: "video_without_hint",
        },
      } satisfies ExternalVideoConfig);
    });

    it("should not include validators if none are set", () => {
      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: createMockField({
          label: "Video without Validators",
          api_key: "video_without_validators",
          validators: {},
        }),
      });

      expect(externalVideoGenerator.generateBuildConfig()).toEqual({
        label: "Video without Validators",
        body: {
          api_key: "video_without_validators",
        },
      } satisfies ExternalVideoConfig);
    });
  });

  describe("With validators", () => {
    describe("Required", () => {
      it("can generate a required external video field", () => {
        const externalVideoGenerator = new ExternalVideoFieldGenerator({
          field: createMockField({
            label: "Required Video",
            api_key: "required_video",
            validators: { required: {} },
          }),
        });

        expect(externalVideoGenerator.generateBuildConfig()).toEqual({
          label: "Required Video",
          body: {
            api_key: "required_video",
            validators: { required: true },
          },
        } satisfies ExternalVideoConfig);
      });

      it("can generate a non-required external video field", () => {
        const externalVideoGenerator = new ExternalVideoFieldGenerator({
          field: createMockField({
            label: "Non-Required Video",
            api_key: "non_required_video",
          }),
        });

        expect(externalVideoGenerator.generateBuildConfig()).toEqual({
          label: "Non-Required Video",
          body: {
            api_key: "non_required_video",
          },
        } satisfies ExternalVideoConfig);
      });
    });
  });

  describe("Method call generation", () => {
    it("generates method call with correct method name", () => {
      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: createMockField({
          label: "Test Video",
          api_key: "test_video",
        }),
      });

      const methodCall = externalVideoGenerator.generateMethodCall();

      expect(methodCall).toMatch(/\.addExternalVideo\(/);
      expect(methodCall).toContain('"Test Video"');
      expect(methodCall).toContain('"test_video"');
    });

    it("generates method call with validators", () => {
      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: createMockField({
          label: "Video with Validators",
          api_key: "video_with_validators",
          validators: {
            required: {},
          },
        }),
      });

      const methodCall = externalVideoGenerator.generateMethodCall();

      expect(methodCall).toContain("required: true");
      expect(methodCall).toMatch(/\.addExternalVideo\(/);
    });

    it("generates method call with hint", () => {
      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: createMockField({
          label: "Video with Hint",
          api_key: "video_with_hint",
          hint: "Upload promotional video",
        }),
      });

      const methodCall = externalVideoGenerator.generateMethodCall();

      expect(methodCall).toContain('"Upload promotional video"');
      expect(methodCall).toMatch(/\.addExternalVideo\(/);
    });
  });

  describe("Real-world API response test", () => {
    it("can handle a realistic External Video field from DatoCMS", () => {
      const apiResponseField: Field = {
        id: "video-field-123",
        type: "field",
        label: "Hero Video",
        field_type: "video",
        api_key: "hero_video",
        hint: "Upload hero section video",
        localized: false,
        validators: {
          required: {},
        },
        position: 1,
        appearance: {
          addons: [],
          editor: "video",
          parameters: {},
        },
        default_value: null,
        deep_filtering_enabled: false,
        item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
        fieldset: null,
      };

      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: apiResponseField,
      });

      const config = externalVideoGenerator.generateBuildConfig();

      expect(config).toEqual({
        label: "Hero Video",
        body: {
          api_key: "hero_video",
          hint: "Upload hero section video",
          validators: {
            required: true,
          },
        },
      } satisfies ExternalVideoConfig);
    });
  });

  describe("getMethodCallName", () => {
    it("returns the correct method name", () => {
      const externalVideoGenerator = new ExternalVideoFieldGenerator({
        field: createMockField({
          label: "Test",
          api_key: "test",
        }),
      });

      expect(externalVideoGenerator.getMethodCallName()).toBe(
        "addExternalVideo",
      );
    });
  });
});
