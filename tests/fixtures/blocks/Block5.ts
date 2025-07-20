import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock5({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 5",
    config,
    options: {
      api_key: "block_5",
      hint: "Test block 5 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
