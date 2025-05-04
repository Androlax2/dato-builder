import BlockBuilder from "../BlockBuilder";

const TestBlock = new BlockBuilder("Test fff ddf")
  .addHeading({
    label: "Title",
  })
  .addTextarea({
    label: "Description",
  })
  .addImage({
    label: "Image",
    body: {
      validators: {
        required: true,
      },
    },
  });

const TestBlockId = TestBlock.upsert();

export default TestBlockId;
