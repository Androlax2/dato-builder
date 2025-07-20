import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildValidBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Valid Block",
    config,
    options: {
      api_key: "valid_block",
      hint: "A valid test block",
    },
  }).addSingleLineString({
    label: "Test Field",
    body: {
      api_key: "test_field",
    },
  });
}
