import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock1({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 1",
    config,
    options: {
      api_key: "block_1",
      hint: "Test block 1 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
