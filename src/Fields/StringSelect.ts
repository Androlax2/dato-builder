import Field from "./Field";
import type { SingleLineStringBody } from "./SingleLineString";

export type StringSelectConfig = {
  label: string;
  options: Array<{ label: string; value: string; hint?: string }>;
  body?: SingleLineStringBody;
};

export default class StringSelect extends Field {
  constructor({ label, options, body }: StringSelectConfig) {
    super("string", {
      ...body,
      label,
      appearance: {
        editor: "string_select",
        parameters: {
          options,
        },
        addons: [],
        ...body?.appearance,
        addons: [
          ...(body?.appearance?.addons || []),
        ],
      },
    });
  }
}
