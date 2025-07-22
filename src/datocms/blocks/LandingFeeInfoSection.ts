import { BlockBuilder } from "dato-builder";
import { BUTTON_BLOCK_ID, TEXT_BLOCK_ID } from "../constants";

export async function buildLandingFeeInfoSectionBlock() {
  return new BlockBuilder("Landing Fee Info Section")
    .addModularContent({
      label: "Content",
      start_collapsed: true,
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [TEXT_BLOCK_ID],
          },
          size: {
            min: 1,
          },
        },
      },
    })
    .addSingleBlock({
      label: "Button",
      body: {
        validators: {
          required: true,
          single_block_blocks: {
            item_types: [BUTTON_BLOCK_ID],
          },
        },
      },
    })
    .upsert();
}

void buildLandingFeeInfoSectionBlock();
