import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo")
  .addLocation({
    label: "Location",
    body: {
      validators: {
        required: true,
      },
    },
  })
  .addSeo({
    label: "SEO",
  })
  .addSlug({
    label: "Slug",
    url_prefix: "/",
    placeholder: "slug",
    body: {
      validators: {
        required: true,
        slug_format: {
          predefined_pattern: "webpage_slug",
        },
      },
    },
  })
  .addExternalVideo({
    label: "External Video",
    body: {
      validators: {
        required: true,
      },
    },
  })
  .addSingleAsset({
    label: "Single Asset",
  });

void TestBlock.upsert();
