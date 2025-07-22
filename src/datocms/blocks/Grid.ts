import { BlockBuilder } from "dato-builder";
import { buildHoverCaptionedImageBlock } from "./HoverCaptionedImage";

export async function buildGridBlock() {
  const hoverCaptionedImageBlockId = await buildHoverCaptionedImageBlock();

  return new BlockBuilder("Grid")
    .addInteger({
      label: "Items per row (mobile)",
      body: {
        default_value: 1,
        validators: {
          required: true,
          number_range: {
            min: 1,
            max: 6,
          },
        },
      },
    })
    .addInteger({
      label: "Items per row (md and up)",
      body: {
        default_value: 2,
        validators: {
          required: true,
          number_range: {
            min: 1,
            max: 6,
          },
        },
      },
    })
    .addInteger({
      label: "Items per row (lg and up)",
      body: {
        default_value: 3,
        validators: {
          required: true,
          number_range: {
            min: 1,
            max: 6,
          },
        },
      },
    })
    .addModularContent({
      label: "Items",
      start_collapsed: true,
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [hoverCaptionedImageBlockId],
          },
          size: {
            min: 1,
          },
        },
      },
    })
    .upsert();
}

void buildGridBlock();
