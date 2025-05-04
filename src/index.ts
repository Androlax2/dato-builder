import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo")
  .addColorPicker({
    label: "Color",
    preset_colors: ["#FF0000", "#00FF00", "#0000FF"],
    body: {
      validators: {
        required: true,
      },
    },
  })
  .addJson({
    label: "Json",
    body: {
      validators: {
        required: true,
      },
    },
  })
  .addStringMultiSelect({
    label: "StringMultiSelect",
    options: [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
      { label: "Option 3", value: "option_3" },
    ],
    body: {
      validators: {
        required: true,
      },
    },
  })
  .addStringCheckboxGroup({
    label: "StringCheckboxGroup",
    options: [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
      { label: "Option 3", value: "option_3" },
    ],
    body: {
      validators: {
        required: true,
      },
    },
  });

void TestBlock.upsert();
