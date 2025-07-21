import type { BuilderContext } from "../../../../../src";
import ModelBuilder from "../../../../../src/ModelBuilder.js";

export default async function buildArticle({
  config,
  getBlock,
  getModel,
}: BuilderContext) {
  return new ModelBuilder({
    name: "Article",
    config,
    body: {
      api_key: "article",
      hint: "Article model that uses both blocks and references other models",
    },
  })
    .addText({
      label: "Article Title",
      body: {
        api_key: "title",
        validators: {
          required: true,
          length: {
            min: 10,
            max: 100,
          },
        },
      },
    })
    .addSlug({
      label: "Slug",
      body: {
        api_key: "slug",
        validators: {
          required: true,
        },
      },
    })
    .addDateTime({
      label: "Published At",
      body: {
        api_key: "published_at",
      },
    })
    .addLink({
      label: "Author",
      body: {
        api_key: "author",
        validators: {
          item_item_type: {
            item_types: [await getModel("Author")],
          },
        },
      },
    })
    .addModularContent({
      label: "Content Blocks",
      body: {
        api_key: "content",
        validators: {
          rich_text_blocks: {
            item_types: [
              await getBlock("ContentBlock"),
              await getBlock("MediaBlock"),
            ],
          },
        },
      },
    });
}
