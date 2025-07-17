import ModelBuilder from "../../ModelBuilder";
import type { BuilderContext } from "../../types/BuilderContext";

/**
 * Build a "Test Reference Model" model in DatoCMS.
 * Generated from DatoCMS API on 2025-07-16T17:30:38.433Z
 * API Key: test_reference_model
 */
export default function buildTestReferenceModel({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Test Reference Model",
    config,
    body: {
      api_key: "test_reference_model",
      singleton: false,
      sortable: false,
      draft_mode_active: false,
      all_locales_required: false,
    },
  })
    .addSingleLineString({
      label: "Name",
      options: {
        heading: false,
      },
      body: {
        api_key: "name",
      },
    })
    .addSlug({
      label: "Slug",
      url_prefix: "",
      placeholder: "",
      body: {
        api_key: "slug",
      },
    });
}
