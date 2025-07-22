import { BlockBuilder } from "dato-builder";

export async function buildFooterBrandingBlock() {
  return new BlockBuilder("Footer Branding", {
    hint: "https://www.datocms-assets.com/157633/1752008302-screenshot-2025-07-08-at-16-58-11.png",
  })
    .addStringSelect({
      label: "Branding",
      body: {
        validators: {
          required: true,
        },
      },
      options: [
        {
          label: "LIA",
          value: "lia",
        },
      ],
    })
    .upsert();
}

void buildFooterBrandingBlock();
