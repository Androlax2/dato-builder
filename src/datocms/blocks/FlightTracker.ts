import { BlockBuilder } from "dato-builder";

export async function buildFlightTrackerBlock() {
  return new BlockBuilder("Flight Tracker", {
    hint: "https://www.datocms-assets.com/157633/1747422577-screenshot-2025-05-16-at-15-09-31.png",
  })
    .addImage({
      label: "Background Image",
      body: {
        validators: {
          required: true,
          required_alt_title: {
            alt: true,
          },
        },
      },
    })
    .addStringRadioGroup({
      label: "Flight Direction",
      radios: [
        { label: "Departures", value: "departures" },
        { label: "Arrivals", value: "arrivals" },
      ],
      body: {
        validators: {
          required: true,
        },
      },
    })
    .upsert();
}

void buildFlightTrackerBlock();
