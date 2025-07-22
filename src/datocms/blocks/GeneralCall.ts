import { BlockBuilder } from "dato-builder";
import { BUTTON_BLOCK_ID, TEXT_BLOCK_ID } from "../constants";

export async function buildGeneralCallBlock() {
  return new BlockBuilder("General Call", {
    hint: "https://www.datocms-assets.com/157633/1752258977-screenshot-2025-07-11-at-14-36-10.png",
  })
    .addHeading({
      label: "Title",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Subtitle",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addWysiwyg({
      label: "Text",
      body: {
        validators: {
          required: true,
          sanitized_html: {
            sanitize_before_validation: true,
          },
        },
      },
      toolbar: ["show_source"],
    })
    .addModularContent({
      label: "Audience List",
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

void buildGeneralCallBlock();
