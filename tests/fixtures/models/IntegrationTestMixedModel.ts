import type { BuilderContext } from "../../../src";
import { ModelBuilder } from "../../../src/index.js";

export default async function buildIntegrationTestMixedModel({
  config,
  getBlock,
  getModel,
}: BuilderContext) {
  return new ModelBuilder({
    name: "Integration Test Mixed Model",
    config,
    body: {
      api_key: "integration_test_mixed_model",
      hint: "Model with mixed block and model references",
      singleton: false,
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
    .addModularContent({
      label: "Content with Blocks",
      body: {
        api_key: "content",
        validators: {
          rich_text_blocks: {
            item_types: [
              await getBlock("IntegrationTestBaseBlock"),
              await getBlock("IntegrationTestComplexBlock"),
            ],
          },
        },
      },
    })
    .addLink({
      label: "Related Model Reference",
      body: {
        api_key: "related_model",
        validators: {
          item_item_type: {
            item_types: [
              await getModel("IntegrationTestBaseModel"),
              await getModel("IntegrationTestRelatedModel"),
            ],
          },
        },
      },
    })
    .addDateTime({
      label: "Published At",
      body: {
        api_key: "published_at",
      },
    });
}
