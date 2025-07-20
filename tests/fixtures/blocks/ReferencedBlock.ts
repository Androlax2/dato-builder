import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildReferencedBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Referenced Block",
    config,
    options: {
      api_key: "referenced_block",
      hint: "A block that gets referenced by other builders",
    },
  })
    .addSingleLineString({
      label: "Title",
      body: {
        api_key: "title",
        validators: {
          required: true,
        },
      },
    })
    .addMarkdown({
      label: "Description",
      toolbar: ["bold", "italic"],
      body: {
        api_key: "description",
      },
    });
}
