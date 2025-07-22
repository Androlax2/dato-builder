import { BlockBuilder } from "dato-builder";
import { buildFareTableBlock } from "./FareTable";

export async function buildFareSheetBlock() {
  return new BlockBuilder("Fare Sheet")
    .addModularContent({
      label: "Tables",
      start_collapsed: true,
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [await buildFareTableBlock()],
          },
          size: {
            min: 1,
          },
        },
      },
    })
    .upsert();
}

void buildFareSheetBlock();
