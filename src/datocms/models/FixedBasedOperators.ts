import { ModelBuilder } from "dato-builder";

export async function buildFixedBasedOperatorsModel() {
  return new ModelBuilder("Fixed Based Operators", {
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
      label: "Address",
      toolbar: ["link"],
      body: {
        localized: true,
        validators: {
          sanitized_html: {
            sanitize_before_validation: true,
          },
        },
      },
    })
    .addSingleLineString({
      label: "Website",
      body: {
        validators: {
          format: {
            predefined_pattern: "url",
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

void buildFixedBasedOperatorsModel();
