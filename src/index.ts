import BlockBuilder from "./BlockBuilder";

const TestBlock = new BlockBuilder("Block yolo")
    .addInteger({
        label: "my super integer",
    })
    .addSingleLineString({
        label: "my super single line string",
        body: {
            validators: {
                required: true,
                unique: true,
            },
        },
    })
    .addSingleLineString({
        label: "heading",
        options: {
            heading: true,
            placeholder: "my super placeholder",
        },
    })
    .addMultiLineText({
        label: "my super multi line text",
        body: {
            validators: {
                required: true,
                sanitized_html: {
                    sanitize_before_validation: true,
                },
            },
        },
    });

void TestBlock.upsert();
