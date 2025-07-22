import { ModelBuilder } from "dato-builder";

export async function buildParkingModel() {
  return new ModelBuilder("Parking", {
    all_locales_required: true,
    draft_mode_active: true,
  })
    .addHeading({
      label: "Name",
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
          sanitized_html: {
            sanitize_before_validation: true,
          },
        },
      },
    })
    .addWysiwyg({
      label: "Rates",
      toolbar: [],
      body: {
        localized: true,
        validators: {
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
          required_alt_title: {
            alt: true,
          },
        },
      },
    })
    .upsert();
}

void buildParkingModel();
