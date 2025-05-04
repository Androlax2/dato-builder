import BlockBuilder from "./BlockBuilder";
import ModelBuilder from "./ModelBuilder";

async function main() {
  const Model = new ModelBuilder("Test Model");

  const ModelId = await Model.upsert();

  const BlockForModularContent = new BlockBuilder(
    "Block for modular content",
  ).addHeading({
    label: "title",
  });

  const BlockForModularContentId = await BlockForModularContent.upsert();

  const TestBlock = new BlockBuilder("Block yolo")
    .addAssetGallery({
      label: "Asset Gallery",
    })
    .addLink({
      label: "Link 2",
      appearance: "expanded",
      body: {
        validators: {
          item_item_type: {
            item_types: [ModelId],
            on_publish_with_unpublished_references_strategy:
              "publish_references",
          },
        },
      },
    })
    .addLinks({
      label: "Links",
      appearance: "expanded",
      body: {
        validators: {
          items_item_type: {
            item_types: [ModelId],
            on_publish_with_unpublished_references_strategy:
              "publish_references",
          },
        },
      },
    })
    .addModularContent({
      label: "content",
      start_collapsed: true,
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [BlockForModularContentId],
          },
        },
      },
    });

  void TestBlock.upsert();
}

void main();
