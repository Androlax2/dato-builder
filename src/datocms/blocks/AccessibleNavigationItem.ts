import { BlockBuilder } from "dato-builder";

export async function buildAccessibleNavigationItemBlock() {
  return new BlockBuilder("Accessible Navigation Item")
    .addText({
      label: "Label",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addSlug({
      label: "Section ID",
      url_prefix: "#",
      body: {
        hint: "The unique identifier for the section this navigation item will link to. This should match the ID of an existing section on your page (e.g., 'about-us', 'contact-form').",
        validators: {
          required: true,
          slug_title_field: {
            title_field_id: "IEBywN2FRxuYv8H1Wv0Hzw",
          },
          slug_format: {
            predefined_pattern: "webpage_slug",
          },
        },
      },
    })
    .upsert();
}

void buildAccessibleNavigationItemBlock();
