import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestUpdateBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Update Block",
    config,
    options: {
      api_key: "test_update_block",
      hint: "Block for testing update detection functionality",
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
    .addInteger({
      label: "Count",
      body: {
        api_key: "count",
        validators: {
          number_range: {
            min: 0,
            max: 100,
          },
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
