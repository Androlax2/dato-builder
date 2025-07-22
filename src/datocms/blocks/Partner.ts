import { BlockBuilder } from "dato-builder";

export async function buildPartnerBlock() {
  return new BlockBuilder("Partner")
    .addImage({
      label: "Logo",
      body: {
        validators: {
          required: true,
          required_alt_title: {
            alt: true,
          },
        },
      },
    })
    .upsert();
}

void buildPartnerBlock();
