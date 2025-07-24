import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestBaseBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Base Block",
    config,
    options: {
      api_key: "test_base_block",
      hint: "Base block for dependency testing",
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
      label: "Is Active",
      body: {
        api_key: "is_active",
      },
    });
}
