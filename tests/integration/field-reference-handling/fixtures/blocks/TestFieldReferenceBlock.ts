import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestFieldReferenceBlock({
  config,
}: BuilderContext) {
  return new BlockBuilder({
    name: "Test Field Reference Block",
    config,
    options: {
      api_key: "test_field_reference_block",
      hint: "Block for testing field reference functionality",
      // Use field resolver function to dynamically find title field
      presentation_title_field: (fields) => {
        const titleField = fields.find((f) => f.api_key === "main_title");
        if (!titleField) throw new Error("Main title field not found");
        return titleField.id;
      },
      // Use direct field ID for image field (will be resolved after fields are built)
      presentation_image_field: null, // Will be set via resolver after build
    },
  })
    .addText({
      label: "Main Title",
      body: {
        api_key: "main_title",
        validators: {
          required: true,
        },
      },
    })
    .addDate({
      label: "Hero Image",
      body: {
        api_key: "hero_image",
        validators: {
          required: false,
        },
      },
    })
    .addText({
      label: "Description",
      body: {
        api_key: "description",
      },
    });
}
