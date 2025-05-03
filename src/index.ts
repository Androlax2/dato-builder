import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo").addMarkdown({
    label: "Markdown",
    toolbar: ["link"],
});

void TestBlock.upsert();
