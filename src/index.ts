import BlockBuilder from "./BlockBuilder";
import ModelBuilder from "./ModelBuilder";

async function main() {
  const Model = new ModelBuilder("Test Model");

  const ModelId = await Model.upsert();

  const TestBlock = new BlockBuilder("Block yolo")
    .addAssetGallery({
      label: "Asset Gallery",
    })
    .addLink({
      label: "Link",
      body: {
        validators: {
          item_item_type: {
            item_types: [ModelId],
            on_publish_with_unpublished_references_strategy:
              "publish_references",
          },
        },
      },
    });

  void TestBlock.upsert();
}

void main();
