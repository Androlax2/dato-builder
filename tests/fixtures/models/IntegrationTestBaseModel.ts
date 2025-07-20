import type { BuilderContext } from "../../../src";
import { ModelBuilder } from "../../../src/index.js";

export default function buildIntegrationTestBaseModel({
  config,
}: BuilderContext) {
  return new ModelBuilder({
    name: "Integration Test Base Model",
    config,
    body: {
      api_key: "integration_test_base_model",
      hint: "Base model for integration testing",
    },
  })
    .addHeading({
      label: "Name",
      body: {
        api_key: "name",
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
          slug_title_field: {
            title_field_id: "name",
          },
        },
      },
    });
}
