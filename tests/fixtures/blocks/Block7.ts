import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock7({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 7",
    config,
    options: {
      api_key: "block_7",
      hint: "Test block 7 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
