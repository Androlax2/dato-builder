import { BlockBuilder } from "dato-builder";
import { buildStepBlock } from "./Step";

export async function buildStepListBlock() {
  return new BlockBuilder("Step List")
    .addModularContent({
      label: "Steps",
      start_collapsed: true,
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [await buildStepBlock()],
          },
          size: {
            min: 2,
          },
        },
      },
    })
    .upsert();
}

void buildStepListBlock();
