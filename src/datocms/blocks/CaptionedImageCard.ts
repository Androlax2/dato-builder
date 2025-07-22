import { BlockBuilder, type BuilderContext } from "dato-builder";
import { IMAGE_BLOCK_ID } from "../constants";

export default async function buildCaptionedImageCardBlock({
  config,
}: BuilderContext) {
  return new BlockBuilder({
    name: "Captioned Image Card",
    config,
    options: {
      hint: "https://www.datocms-assets.com/157633/1748022774-screenshot-2025-05-23-at-13-52-37.png",
    },
  })
    .addSingleBlock({
      label: "Image",
      body: {
        validators: {
          required: true,
          single_block_blocks: {
            item_types: [IMAGE_BLOCK_ID],
          },
        },
      },
    })
    .addText({
      label: "Caption title",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Caption Description",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .upsert();
}
