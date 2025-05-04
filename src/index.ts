import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo").addLocation({
  label: "Location",
  body: {
    validators: {
      required: true,
    },
  },
});

void TestBlock.upsert();
