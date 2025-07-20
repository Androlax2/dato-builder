import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock4({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 4",
    config,
    options: {
      api_key: "block_4",
      hint: "Test block 4 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
