import type { BuilderContext } from "../../../../../src";
import ModelBuilder from "../../../../../src/ModelBuilder.js";

export default function buildAuthor({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Author",
    config,
    body: {
      api_key: "author",
      hint: "Author model for mixed dependency testing",
    },
  })
    .addText({
      label: "Full Name",
      body: {
        api_key: "name",
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Email",
      body: {
        api_key: "email",
        validators: {
          required: true,
          format: {
            predefined_pattern: "email",
          },
        },
      },
    })
    .addText({
      label: "Bio",
      body: {
        api_key: "bio",
        appearance: {
          editor: "wysiwyg",
          parameters: {},
          addons: [],
        },
      },
    })
    .addSingleAsset({
      label: "Avatar",
      body: {
        api_key: "avatar",
        validators: {
          extension: {
            predefined_list: "image",
          },
        },
      },
    });
}
