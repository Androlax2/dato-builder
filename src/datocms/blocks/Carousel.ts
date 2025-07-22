import { BlockBuilder } from "dato-builder";
import { buildAccessibilityFeatureCardBlock } from "./AccessibilityFeatureCard";

export async function buildCarouselBlock() {
  return new BlockBuilder("Carousel")
    .addModularContent({
      label: "Slides",
      start_collapsed: true,
      body: {
        validators: {
          size: {
            min: 5,
          },
          rich_text_blocks: {
            item_types: [await buildAccessibilityFeatureCardBlock()],
          },
        },
      },
    })
    .upsert();
}

void buildCarouselBlock();
