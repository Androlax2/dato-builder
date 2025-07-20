import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildBlock10({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Block 10",
    config,
    options: {
      api_key: "block_10",
      hint: "Test block 10 for performance testing",
    },
  }).addSingleLineString({
    label: "Title",
    body: {
      api_key: "title",
    },
  });
}
