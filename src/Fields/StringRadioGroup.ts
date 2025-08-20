import Field from "./Field";
import type { SingleLineStringBody } from "./SingleLineString";

export type StringRadioGroupConfig = {
  label: string;
  radios: Array<{ label: string; value: string; hint?: string }>;
  body?: SingleLineStringBody;
};

export default class StringRadioGroup extends Field {
  constructor({ label, radios, body }: StringRadioGroupConfig) {
    super("string", {
      ...body,
      label,
      appearance: {
        editor: "string_radio_group",
        parameters: {
          radios,
        },
        addons: body?.addons || [],
      },
    });
  }
}
