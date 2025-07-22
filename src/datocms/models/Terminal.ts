import { ModelBuilder } from "dato-builder";

const TerminalModel = new ModelBuilder("Terminal", {
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
    label: "Address",
    toolbar: [],
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
  .addWysiwyg({
    label: "Administrative Offices",
    body: {
      localized: true,
      validators: {
        sanitized_html: {
          sanitize_before_validation: true,
        },
      },
    },
    toolbar: ["link"],
  })
  .addLocation({
    label: "Location",
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
  });

const TerminalModelId = TerminalModel.upsert();

export default TerminalModelId;
