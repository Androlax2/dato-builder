import { BlockBuilder } from "dato-builder";

export async function buildKickerHeadlineBlock() {
  return new BlockBuilder("Kicker Headline", {
    hint: "https://www.datocms-assets.com/157633/1752166459-screenshot-2025-07-10-at-12-54-14.png",
  })
    .addText({
      label: "Kicker",
      body: {
        validators: {
          required: false,
        },
      },
    })
    .addHeading({
      label: "Headline",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .upsert();
}

void buildKickerHeadlineBlock();
