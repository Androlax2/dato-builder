import { BlockBuilder } from "dato-builder";

export async function buildStepBlock() {
  return new BlockBuilder("Step")
    .addHeading({
      label: "Title",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addTextarea({
      label: "Description",
      body: {
        validators: {
          sanitized_html: {
            sanitize_before_validation: true,
          },
          required: true,
        },
      },
    })
    .upsert();
}

void buildStepBlock();
