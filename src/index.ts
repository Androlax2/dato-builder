import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo").addInteger("Yolo number", {
    validators: {
        required: true,
    },
});

void TestBlock.upsert();
