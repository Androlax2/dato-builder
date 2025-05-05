# Dato Builder

Quickly create Models, Blocks in DatoCMS from your source code.

## Table of Contents

- [Installation](#installation)
  - [Configuration](#configuration)
- [Simple Example](#simple-example)
  - [Block](#block)
  - [Model](#model)

## Installation

```bash
npm install --save-dev dato-builder
```

### Configuration

Create a `dato-builder.config.js` file in the root of your project with the following content:

```javascript
/**
 * @type {import("dato-builder").DatoBuilderConfig}
 */
const config = {
    apiToken: "YOUR_DATO_CMA_TOKEN",
    overwriteExistingFields: false,
};

module.exports = config;
```

## Simple Example

### Block

`datocms/blocks/test-block.ts`
```typescript
import { BlockBuilder } from "dato-builder";

const TestBlock = new BlockBuilder("Test Block")
    .addHeading({
        label: "Title",
    })
    .addTextarea({
        label: "Description",
    })
    .addImage({
        label: "Image",
        body: {
            validators: {
                required: true,
            },
        },
    });

const TestBlockId = TestBlock.upsert();

export default TestBlockId;
```

This will create a new block in DatoCMS with the name "Test Block" and the following fields:

- Title: A heading field
- Description: A textarea field
- Image: An image field with a required validator

To run it you can use the following command:

```bash
npx dato-builder run datocms/blocks/test-block.ts
```

### Model

`datocms/models/test-model.ts`
```typescript
import { ModelBuilder } from "dato-builder";
import TestBlockId from "../blocks/test-block";

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
```

This will create a new model in DatoCMS with the name "Test Model" and the following fields:
- Title: A heading field
- Description: A textarea field
- Content: A modular content field with a validator that only allows the "Test Block" block to be used

To run it you can use the following command:

```bash
npx dato-builder run datocms/models/test-model.ts
```

To run everything together you can use the following command:

```bash
npx dato-builder run datocms/
```
