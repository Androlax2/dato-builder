import Field from "./Field";
import type { SingleLineStringBody } from "./SingleLineString";

export type TextareaConfig = {
  label: string;
  placeholder?: string;
  body?: SingleLineStringBody;
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
