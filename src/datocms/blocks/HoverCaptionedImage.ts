import { BlockBuilder } from "dato-builder";

export async function buildHoverCaptionedImageBlock() {
  return new BlockBuilder("Hover Captioned Image", {
    hint: "https://www.datocms-assets.com/157633/1747931227-screenshot-2025-05-22-at-12-27-01.png",
  })
    .addImage({
      label: "Image",
      body: {
        validators: {
          required: true,
          extension: {
            predefined_list: "transformable_image",
          },
          required_alt_title: {
            alt: true,
          },
        },
      },
    })
    .addText({
      label: "Caption Title",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Caption Description",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .upsert();
}

void buildHoverCaptionedImageBlock();
