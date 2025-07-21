import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestBuildFlagsBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Build Flags Block",
    config,
    options: {
      api_key: "test_build_flags_block",
      hint: "Block for testing CLI build flags",
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
      label: "Published",
      body: {
        api_key: "published",
      },
    });
}
