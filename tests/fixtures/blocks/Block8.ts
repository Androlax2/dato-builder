import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock8({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 8",
    config,
    options: {
      api_key: "block_8",
      hint: "Test block 8 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
