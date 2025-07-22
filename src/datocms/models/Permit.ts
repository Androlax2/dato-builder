import { ModelBuilder } from "dato-builder";
import { BUTTON_BLOCK_ID } from "../constants";

export async function buildPermitModel() {
  return new ModelBuilder("Permit", {
    all_locales_required: true,
    draft_mode_active: true,
  })
    .addHeading({
      label: "Title",
      body: {
        localized: true,
        validators: {
          required: true,
          unique: true,
        },
      },
    })
    .addWysiwyg({
      label: "Description",
      toolbar: ["bold"],
      body: {
        localized: true,
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
    })
    .addModularContent({
      label: "Buttons",
      start_collapsed: true,
      body: {
        localized: true,
        validators: {
          rich_text_blocks: {
            item_types: [BUTTON_BLOCK_ID],
          },
        },
      },
    })
    .upsert();
}

void buildPermitModel();
