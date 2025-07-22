import { BlockBuilder } from "dato-builder";

export async function buildHoverPreviewItemBlock() {
  return new BlockBuilder("Hover Preview Item")
    .addText({
      label: "Text",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addImage({
      label: "Image",
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

void buildHoverPreviewItemBlock();
