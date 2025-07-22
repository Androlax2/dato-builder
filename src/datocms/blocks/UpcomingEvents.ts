import { BlockBuilder } from "dato-builder";
import { buildEventBlock } from "./Event";

export async function buildUpcomingEventsBlock() {
  return new BlockBuilder("Upcoming Events")
    .addHeading({
      label: "Title",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addModularContent({
      label: "Events",
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [await buildEventBlock()],
          },
          size: {
            min: 1,
          },
        },
      },
    })
    .upsert();
}

void buildUpcomingEventsBlock();
