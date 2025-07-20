import type { BuilderContext } from "../../../src";
import { ModelBuilder } from "../../../src/index.js";

export default async function buildIntegrationTestRelatedModel({
  config,
  getModel,
}: BuilderContext) {
  return new ModelBuilder({
    name: "Integration Test Related Model",
    config,
    body: {
      api_key: "integration_test_related_model",
      hint: "Model that references another model via async getModel",
    },
  })
    .addHeading({
      label: "Title",
      body: {
        api_key: "title",
        validators: {
          required: true,
        },
      },
    })
    .addLink({
      label: "Related Base Model",
      body: {
        api_key: "related_base_model",
        validators: {
          item_item_type: {
            item_types: [await getModel("IntegrationTestBaseModel")],
          },
        },
      },
    })
    .addLinks({
      label: "Multiple Base Models",
      body: {
        api_key: "multiple_base_models",
        validators: {
          items_item_type: {
            item_types: [await getModel("IntegrationTestBaseModel")],
          },
        },
      },
    });
}
