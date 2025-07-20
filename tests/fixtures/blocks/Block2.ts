import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock2({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 2",
    config,
    options: {
      api_key: "block_2",
      hint: "Test block 2 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
