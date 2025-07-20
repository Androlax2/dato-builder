import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder.js";

export default function buildIntegrationTestBaseBlock({
  config,
}: BuilderContext) {
  return new BlockBuilder({
    name: "Integration Test Base Block",
    config,
    options: {
      api_key: "integration_test_base_block",
      hint: "Base block for integration testing",
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
    .addBoolean({
      label: "Is Active",
      body: {
        api_key: "is_active",
      },
    });
}
