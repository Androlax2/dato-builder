import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock3({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 3",
    config,
    options: {
      api_key: "block_3",
      hint: "Test block 3 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
