import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Block",
    config,
    options: {
      api_key: "test_block",
      hint: "A test block for integration testing",
    },
  })
    .addSingleLineString({
      label: "Title",
      body: {
        api_key: "title",
      },
    })
    .addMultiLineText({
      label: "Content",
      body: {
        api_key: "content",
      },
    });
}
