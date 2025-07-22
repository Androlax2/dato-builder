import { BlockBuilder } from "dato-builder";
import { buildPartnerBlock } from "./Partner";

export async function buildPartnerGridBlock() {
  return new BlockBuilder("Partner Grid")
    .addHeading({
      label: "Title",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addModularContent({
      label: "Partners",
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [await buildPartnerBlock()],
          },
          size: {
            min: 1,
          },
        },
      },
    })
    .upsert();
}

void buildPartnerGridBlock();
