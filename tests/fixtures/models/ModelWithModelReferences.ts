import type { BuilderContext } from "../../../src";
import ModelBuilder from "../../../src/ModelBuilder";

export default function buildModelWithModelReferences({
  config,
}: BuilderContext) {
  return new ModelBuilder({
    name: "Model With Model References",
    config,
    body: {
      api_key: "model_with_model_refs",
      singleton: false,
      sortable: true,
      draft_mode_active: true,
    },
  })
    .addSingleLineString({
      label: "Title",
      body: {
        api_key: "title",
        validators: {
          required: true,
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
            title_field_id: "title",
          },
        },
      },
    });
}
