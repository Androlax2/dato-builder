import { BlockBuilder } from "dato-builder";
import { buildFareTableRowBlock } from "./FareTableRow";

export async function buildFareTableBlock() {
  return new BlockBuilder("Fare Table")
    .addHeading({
      label: "Title",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addModularContent({
      label: "Rows",
      start_collapsed: true,
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [await buildFareTableRowBlock()],
          },
          size: {
            min: 1,
          },
        },
      },
    })
    .upsert();
}

void buildFareTableBlock();
