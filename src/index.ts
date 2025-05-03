import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo")
    .addInteger("my super integer")
    .addSingleLineString("my super string", {
        validators: {
            required: true,
        },
    })

    .addMultiLineText("my super multi line text", {
        validators: {
            sanitized_html: {
                sanitize_before_validation: true,
            },
        },
    });

void TestBlock.upsert();
