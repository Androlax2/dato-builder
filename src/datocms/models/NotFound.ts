import { ModelBuilder } from "dato-builder";

export async function buildNotFoundModel() {
  return new ModelBuilder("Not Found", {
    draft_mode_active: true,
    singleton: true,
  })
    .addImage({
      label: "Background Image",
      body: {
        validators: {
          required: true,
          extension: {
            predefined_list: "transformable_image",
          },
        },
      },
    })
    .upsert();
}

void buildNotFoundModel();
