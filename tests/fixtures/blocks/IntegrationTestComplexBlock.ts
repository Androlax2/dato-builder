import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder.js";

export default async function buildIntegrationTestComplexBlock({
  config,
  getBlock,
}: BuilderContext) {
  return new BlockBuilder({
    name: "Integration Test Complex Block",
    config,
    options: {
      api_key: "integration_test_complex_block",
      hint: "Complex block with multiple async dependencies",
    },
  })
    .addText({
      label: "Complex Title",
      body: {
        api_key: "complex_title",
        validators: {
          required: true,
        },
      },
    })
    .addModularContent({
      label: "Content with Multiple Blocks",
      body: {
        api_key: "content",
        validators: {
          rich_text_blocks: {
            item_types: [
              await getBlock("IntegrationTestBaseBlock"),
              await getBlock("IntegrationTestReferenceBlock"),
            ],
          },
        },
      },
    })
    .addInteger({
      label: "Priority",
      body: {
        api_key: "priority",
        validators: {
          number_range: {
            min: 0,
            max: 100,
          },
        },
      },
    });
}
