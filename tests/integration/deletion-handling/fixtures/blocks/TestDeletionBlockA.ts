import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestDeletionBlockA({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Deletion Block A",
    config,
    options: {
      api_key: "test_deletion_block_a",
      hint: "Block A for testing deletion handling",
    },
  })
    .addText({
      label: "Title A",
      body: {
        api_key: "title_a",
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Description A",
      body: {
        api_key: "description_a",
      },
    });
}
