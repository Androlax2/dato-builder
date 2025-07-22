import { BlockBuilder } from "dato-builder";

export async function buildAccessibilityFeatureCardBlock() {
  return new BlockBuilder("Accessibility Feature Card")
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

void buildAccessibilityFeatureCardBlock();
