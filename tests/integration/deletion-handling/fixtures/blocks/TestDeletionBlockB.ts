import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestDeletionBlockB({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Deletion Block B",
    config,
    options: {
      api_key: "test_deletion_block_b",
      hint: "Block B for testing deletion handling",
    },
  })
    .addText({
      label: "Title B",
      body: {
        api_key: "title_b",
      },
    })
    .addBoolean({
      label: "Active B",
      body: {
        api_key: "active_b",
      },
    });
}
