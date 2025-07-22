import { BlockBuilder } from "dato-builder";
import { buildCaptionedImageCardBlock } from "./CaptionedImageCard";

export async function buildCaptionedImageCardMarqueeBlock() {
  const captionedImageCardBlockId = await buildCaptionedImageCardBlock();

  return new BlockBuilder("Captioned Image Card Marquee", {
    hint: "https://www.datocms-assets.com/157633/1748022791-screenshot-2025-05-23-at-13-53-04.png",
  })
    .addModularContent({
      label: "Items",
      start_collapsed: true,
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [captionedImageCardBlockId],
          },
          size: {
            min: 3,
          },
        },
      },
    })
    .upsert();
}

void buildCaptionedImageCardMarqueeBlock();
