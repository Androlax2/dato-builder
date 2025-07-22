import { BlockBuilder } from "dato-builder";
import { buildInsightCardBlock } from "./InsightCard";

export async function buildInsightCardListBlock() {
  return new BlockBuilder("Insight Card List", {
    hint: "https://www.datocms-assets.com/157633/1752510544-footer-content-container.jpg",
  })
    .addModularContent({
      label: "Items",
      start_collapsed: true,
      body: {
        validators: {
          size: {
            min: 2,
          },
          rich_text_blocks: {
            item_types: [await buildInsightCardBlock()],
          },
        },
      },
    })
    .upsert();
}

void buildInsightCardListBlock();
