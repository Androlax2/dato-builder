import { BlockBuilder } from "dato-builder";
import { buildAccessibleNavigationItemBlock } from "./AccessibleNavigationItem";

export async function buildAccessibleNavigationMenuBlock() {
  return new BlockBuilder("Accessible Navigation Menu")
    .addModularContent({
      label: "Items",
      start_collapsed: true,
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [await buildAccessibleNavigationItemBlock()],
          },
          size: {
            min: 2,
          },
        },
      },
    })
    .upsert();
}

void buildAccessibleNavigationMenuBlock();
