import Field from "./Field";
import type { MultiLineTextBody } from "./MultiLineText";

export type MarkdownConfig = {
  label: string;
  toolbar: Array<
    | "heading"
    | "bold"
    | "italic"
    | "strikethrough"
    | "code"
    | "unordered_list"
    | "ordered_list"
    | "quote"
    | "link"
    | "image"
    | "fullscreen"
  >;
  body?: MultiLineTextBody;
};

export default class Markdown extends Field {
  constructor({ label, toolbar, body }: MarkdownConfig) {
    super("text", {
      ...body,
      label,
      appearance: {
        editor: "markdown",
        parameters: {
          toolbar,
        },
        addons: [],
      },
    });
  }
}
