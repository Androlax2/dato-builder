import type { BuilderContext } from "../../../../../src";
import ModelBuilder from "../../../../../src/ModelBuilder.js";

export default function buildTestFieldReferenceModel({
  config,
}: BuilderContext) {
  return new ModelBuilder({
    name: "Test Field Reference Model",
    config,
    options: {
      api_key: "test_field_reference_model",
      hint: "Model for testing field reference functionality",
      sortable: false,
      // Use field resolver for presentation title
      presentation_title_field: (fields) => {
        const titleField = fields.find((f) => f.api_key === "title");
        if (!titleField) throw new Error("Title field not found");
        return titleField.id;
      },
      // Use field resolver for excerpt
      excerpt_field: (fields) => {
        const excerptField = fields.find((f) => f.api_key === "summary");
        if (!excerptField) throw new Error("Excerpt field not found");
        return excerptField.id;
      },
    },
  })
    .addText({
      label: "Title",
      body: {
        api_key: "title",
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Summary",
      body: {
        api_key: "summary",
      },
    })
    .addDate({
      label: "Featured Image",
      body: {
        api_key: "featured_image",
      },
    });
}
