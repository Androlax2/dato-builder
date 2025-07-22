import { BlockBuilder } from "dato-builder";
import { FEATURE_INFO_CARD_BLOCK_ID } from "../constants";

export async function buildFeatureInfoCardListBlock() {
  return new BlockBuilder("Feature Info Card List")
    .addModularContent({
      label: "Items",
      start_collapsed: true,
      body: {
        validators: {
          size: {
            min: 2,
          },
          rich_text_blocks: {
            item_types: [FEATURE_INFO_CARD_BLOCK_ID],
          },
        },
      },
    })
    .upsert();
}

void buildFeatureInfoCardListBlock();
