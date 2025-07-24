import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestStateBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test State Block",
    config,
    options: {
      api_key: "test_state_block",
      hint: "Block for testing state management and subsequent builds",
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
      label: "Is Published",
      body: {
        api_key: "is_published",
      },
    })
    .addInteger({
      label: "View Count",
      body: {
        api_key: "view_count",
        validators: {
          number_range: {
            min: 0,
            max: 1000000,
          },
        },
      },
    });
}
