import ModelBuilder from "../../ModelBuilder";
import type { BuilderContext } from "../../types/BuilderContext";

export default function buildTestReferenceModel({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Test Reference Model",
    config,
    body: {
      api_key: "test_reference_model",
      hint: "Simple model for testing references",
      collection_appearance: "table",
      ordering_field: null,
      ordering_direction: null,
      tree: false,
      draft_mode_active: false,
      all_locales_required: false,
    },
  })
    .addText({ label: "Name", body: { api_key: "name" } })
    .addSlug({ label: "Slug", body: { api_key: "slug" } });
}
