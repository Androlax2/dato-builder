import { BlockBuilder } from "dato-builder";

export async function buildInsightCardBlock() {
  return new BlockBuilder("Insight Card", {
    hint: "https://www.datocms-assets.com/157633/1752506549-footer-content-item.jpg",
  })
    .addHeading({
      label: "Title",
      body: {
        hint: "You can use variables like {{current_index}} and {{total_index}} to dynamically insert the current item index and total count.",
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Subtitle",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addWysiwyg({
      toolbar: ["bold", "italic", "link"],
      label: "Content",
      body: {
        validators: {
          required: true,
          sanitized_html: {
            sanitize_before_validation: true,
          },
        },
      },
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
    .upsert();
}

void buildInsightCardBlock();
