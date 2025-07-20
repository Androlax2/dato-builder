import type { BuilderContext } from "../../../src";
import ModelBuilder from "../../../src/ModelBuilder";

export default function buildReferencedModel({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Referenced Model",
    config,
    body: {
      api_key: "referenced_model",
      singleton: false,
      sortable: true,
      draft_mode_active: false,
    },
  })
    .addSingleLineString({
      label: "Name",
      body: {
        api_key: "name",
        validators: {
          required: true,
          unique: true,
        },
      },
    })
    .addSlug({
      label: "Slug",
      body: {
        api_key: "slug",
        validators: {
          required: true,
          slug_title_field: {
            title_field_id: "name",
          },
        },
      },
    })
    .addMarkdown({
      label: "Content",
      toolbar: ["bold", "italic", "link"],
      body: {
        api_key: "content",
        validators: {
          required: false,
        },
      },
    });
}
