import Field from "./Field";
import type { MultiLineTextBody } from "./MultiLineText";

export type TextareaConfig = {
  label: string;
  placeholder?: string;
  body?: MultiLineTextBody;
};

export default class Textarea extends Field {
  constructor({ label, placeholder, body }: TextareaConfig) {
    super("text", {
      ...body,
      label,
      appearance: {
        editor: "textarea",
        parameters: {
          placeholder,
        },
        addons: [],
      },
    });
  }
}
