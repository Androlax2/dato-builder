import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestSimpleBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Simple Block",
    config,
    options: {
      api_key: "test_simple_block",
      hint: "Simple block for integration testing",
    },
  })
    .addText({
      label: "Title",
      body: {
        api_key: "title",
        validators: {
          required: true,
        },
      },
    })
    .addBoolean({
      label: "Is Enabled",
      body: {
        api_key: "is_enabled",
      },
    });
}
