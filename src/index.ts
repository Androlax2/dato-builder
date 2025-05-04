import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo").addAssetGallery({
  label: "Asset Gallery",
});

void TestBlock.upsert();
