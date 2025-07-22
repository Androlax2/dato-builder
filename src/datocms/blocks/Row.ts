import { BlockBuilder } from "dato-builder";
import {
  FEATURE_INFO_CARD_BLOCK_ID,
  IMAGE_WITH_ACTIONS_BLOCK_ID,
} from "../constants";

const RowBlock = new BlockBuilder("Row").addModularContent({
  label: "Items",
  body: {
    validators: {
      rich_text_blocks: {
        item_types: [IMAGE_WITH_ACTIONS_BLOCK_ID, FEATURE_INFO_CARD_BLOCK_ID],
      },
      size: {
        min: 2,
      },
    },
  },
});

void RowBlock.upsert();
