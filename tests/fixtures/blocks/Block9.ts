import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock9({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 9",
    config,
    options: {
      api_key: "block_9",
      hint: "Test block 9 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
