import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock6({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 6",
    config,
    options: {
      api_key: "block_6",
      hint: "Test block 6 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
