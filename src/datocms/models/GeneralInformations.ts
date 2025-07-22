import { ModelBuilder } from "dato-builder";
import { BUTTON_BLOCK_ID } from "../constants";

export default async function buildGeneralInformationsModel(): Promise<string> {
  return new ModelBuilder("General Informations", {
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
    .addSingleBlock({
      label: "Button",
      body: {
        localized: true,
        validators: {
          single_block_blocks: {
            item_types: [BUTTON_BLOCK_ID],
          },
        },
      },
    })
    .upsert();
}

void buildGeneralInformationsModel();
