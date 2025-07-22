import { BlockBuilder } from "dato-builder";
import { buildHoverPreviewItemBlock } from "./HoverPreviewItem";

export async function buildHoverPreviewListBlock() {
  return new BlockBuilder("Hover Preview List", {
    hint: "https://www.datocms-assets.com/157633/1752241607-screenshot-2025-07-11-at-09-46-43.png",
  })
    .addModularContent({
      label: "Items",
      start_collapsed: true,
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [await buildHoverPreviewItemBlock()],
          },
          size: {
            min: 2,
          },
        },
      },
    })
    .upsert();
}

void buildHoverPreviewListBlock();
