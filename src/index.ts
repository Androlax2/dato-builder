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
  })
  .addDate({
    label: "Date",
    body: {
      validators: {
        required: true,
        date_range: {
          min: new Date("2023-01-01"),
          max: new Date("2023-12-31"),
        },
      },
    },
  })
  .addDateTime({
    label: "DateTime",
    body: {
      validators: {
        required: true,
        date_time_range: {
          min: new Date("2023-01-01T00:00:00"),
          max: new Date("2023-12-31T23:59:59"),
        },
      },
    },
  });

void TestBlock.upsert();
