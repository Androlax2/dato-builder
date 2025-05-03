import Field from "./Field";
import type {SingleLineStringBody} from "./SingleLineString";

export type WysiwygConfig = {
    label: string;
    toolbar: Array<
        | "format"
        | "bold"
        | "italic"
        | "strikethrough"
        | "code"
        | "ordered_list"
        | "unordered_list"
        | "quote"
        | "table"
        | "link"
        | "image"
        | "show_source"
        | "undo"
        | "redo"
        | "align_left"
        | "align_center"
        | "align_right"
        | "align_justify"
        | "outdent"
        | "indent"
        | "fullscreen"
    >;
    body?: SingleLineStringBody;
};

export default class Wysiwyg extends Field {
    constructor({label, toolbar, body}: WysiwygConfig) {
        super("text", {
            ...body,
            label,
            appearance: {
                editor: "wysiwyg",
                parameters: {
                    toolbar,
                },
                addons: [],
            },
        });
    }
}
