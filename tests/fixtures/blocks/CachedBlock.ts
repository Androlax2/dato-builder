import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildCachedBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Cached Block",
    config,
    options: {
      api_key: "cached_block",
      hint: "A test block for cache testing",
    },
  }).addSingleLineString({
    label: "Name",
    body: {
      api_key: "name",
    },
  });
}
