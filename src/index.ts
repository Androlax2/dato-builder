import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo").addColorPicker({
  label: "Color",
  preset_colors: ["#FF0000", "#00FF00", "#0000FF"],
  body: {
    validators: {
      required: true,
    },
  },
});

void TestBlock.upsert();
