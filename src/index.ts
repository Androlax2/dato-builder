import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo")
    .addInteger("my super integer")
    .addSingleLineString("my super string", {
        validators: {
            required: true,
        },
    });

void TestBlock.upsert();
