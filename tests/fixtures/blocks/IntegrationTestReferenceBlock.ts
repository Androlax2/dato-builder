import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder.js";

export default async function buildIntegrationTestReferenceBlock({
  config,
  getBlock,
}: BuilderContext) {
  return new BlockBuilder({
    name: "Integration Test Reference Block",
    config,
    options: {
      api_key: "integration_test_reference_block",
      hint: "Block that references another block via async getBlock",
    },
  })
    .addText({
      label: "Reference Title",
      body: {
        api_key: "reference_title",
        validators: {
          required: true,
        },
      },
    })
    .addModularContent({
      label: "Base Block Reference",
      body: {
        api_key: "base_block_reference",
        validators: {
          rich_text_blocks: {
            item_types: [await getBlock("IntegrationTestBaseBlock")],
          },
        },
      },
    });
}
