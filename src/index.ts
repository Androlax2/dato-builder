import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo")
  .addBoolean({
    label: "Boolean",
  })
  .addBooleanRadioGroup({
    label: "Boolean Radio Group",
    positive_radio: { label: "Yes" },
    negative_radio: { label: "No" },
  });

void TestBlock.upsert();
