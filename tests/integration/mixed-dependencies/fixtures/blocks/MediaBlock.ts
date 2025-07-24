import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default async function buildMediaBlock({
  config,
  getBlock,
}: BuilderContext) {
  return new BlockBuilder({
    name: "Media Block",
    config,
    options: {
      api_key: "media_block",
      hint: "Media block that can contain content blocks",
    },
  })
    .addText({
      label: "Media Title",
      body: {
        api_key: "media_title",
        validators: {
          required: true,
        },
      },
    })
    .addSingleAsset({
      label: "Media File",
      body: {
        api_key: "media_file",
        validators: {
          required: true,
          extension: {
            predefined_list: "image",
          },
        },
      },
    })
    .addModularContent({
      label: "Related Content",
      body: {
        api_key: "related_content",
        validators: {
          rich_text_blocks: {
            item_types: [await getBlock("ContentBlock")],
          },
        },
      },
    });
}
