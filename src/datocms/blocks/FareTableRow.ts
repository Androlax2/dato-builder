import { BlockBuilder } from "dato-builder";

export async function buildFareTableRowBlock() {
  return new BlockBuilder("Fare Table Row")
    .addText({
      label: "Minimum Mass",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Maximum Mass",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Pricing",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .upsert();
}

void buildFareTableRowBlock();
