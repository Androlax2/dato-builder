import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo")
    .addMarkdown({
        label: "Markdown",
        toolbar: ["link"],
    })
    .addWysiwyg({
        label: "Wysiwyg",
        toolbar: ["link"],
    });

void TestBlock.upsert();
