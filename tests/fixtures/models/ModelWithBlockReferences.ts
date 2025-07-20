import type { BuilderContext } from "../../../src";
import ModelBuilder from "../../../src/ModelBuilder";

export default function buildModelWithBlockReferences({
  config,
}: BuilderContext) {
  return new ModelBuilder({
    name: "Model With Block References",
    config,
    body: {
      api_key: "model_with_block_refs",
      singleton: false,
      sortable: true,
      draft_mode_active: true,
    },
  })
    .addSingleLineString({
      label: "Page Title",
      body: {
        api_key: "page_title",
        validators: {
          required: true,
          unique: true,
        },
      },
    })
    .addMarkdown({
      label: "Content",
      toolbar: ["bold", "italic"],
      body: {
        api_key: "content",
      },
    });
}
