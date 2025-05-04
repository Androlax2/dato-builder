import ModelBuilder from "../ModelBuilder";
import TestBlockId from "./block";

async function main() {
  const testBlockId = await TestBlockId;

  const TestModel = new ModelBuilder("Test Model")
    .addHeading({
      label: "title",
    })
    .addTextarea({
      label: "description",
    })
    .addModularContent({
      label: "content",
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [testBlockId],
          },
        },
      },
    });

  void TestModel.upsert();
}

void main();
