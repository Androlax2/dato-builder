import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo")
  .addBoolean({
    label: "Boolean",
  })
  .addBooleanRadioGroup({
    label: "Boolean Radio Group",
    positive_radio: { label: "Yes" },
    negative_radio: { label: "No" },
  })
  .addFloat({
    label: "Float",
    body: {
      validators: {
        required: true,
        number_range: {
          min: 0,
          max: 100,
        },
      },
    },
  });

void TestBlock.upsert();
