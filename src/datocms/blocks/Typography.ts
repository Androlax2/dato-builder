import { BlockBuilder, type BuilderContext } from "dato-builder";
import { typographyVariantStyles } from "../../src/lib/typography";
/**
 * Build a "Typography" block in DatoCMS with fields for content and style variants.
 */
export default async function buildTypographyBlock({ config }: BuilderContext) {
  const variants = Object.keys(typographyVariantStyles).map((key) => ({
    label: key.replace(/-/g, " "),
    value: key,
  }));

  return new BlockBuilder({
    name: "Typography",
    config,
  })
    .addWysiwyg({
      label: "Content",
      body: {
        validators: {
          required: true,
          sanitized_html: {
            sanitize_before_validation: true,
          },
        },
      },
      toolbar: [
        "format",
        "strikethrough",
        "unordered_list",
        "ordered_list",
        "bold",
        "italic",
        "link",
        "show_source",
        "fullscreen",
      ],
    })
    .addStringSelect({
      label: "Typography Variant",
      body: {
        validators: {
          required: true,
        },
        hint: "Select the base typography style",
      },
      options: variants,
    })
    .addStringSelect({
      label: "MD Variant",
      options: variants,
      body: {
        hint: "Variant to apply at md breakpoint (leave blank for none)",
      },
    })
    .upsert();
}
