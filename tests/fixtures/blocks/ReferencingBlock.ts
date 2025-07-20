import type { BuilderContext } from "../../../src";
import BlockBuilder from "../../../src/BlockBuilder";

export default function buildReferencingBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Referencing Block",
    config,
    options: {
      api_key: "referencing_block",
      hint: "A block that references another block",
    },
  })
    .addSingleLineString({
      label: "Block Name",
      body: {
        api_key: "block_name",
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
