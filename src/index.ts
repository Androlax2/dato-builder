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
    .addHeading({
        label: "heading 2",
        body: {
            validators: {
                required: true,
            },
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
    })
    .addStringRadioGroup({
        label: "string radio group",
        radios: [
            {label: "radio 1", value: "value1"},
            {label: "radio 2", value: "value2"},
            {label: "radio 3", value: "value3"},
        ],
    })
    .addStringSelect({
        label: "string select",
        options: [
            {label: "option 1", value: "value1"},
            {label: "option 2", value: "value2"},
            {label: "option 3", value: "value3"},
        ],
    });

void TestBlock.upsert();
