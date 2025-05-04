# Dato Builder

Quickly create Models, Blocks in DatoCMS from your source code.

## Table of Contents

- [Installation](#installation)
  - [Configuration](#configuration)
- [Simple Example](#simple-example)

## Installation

```bash
npm install --save-dev dato-builder
```

### Configuration

Create a `dato-builder.config.js` or `dato-builder.config.ts` file in the root of your project with the following content:

`dato-builder.config.ts`
```typescript
import type { DatoBuilderConfig } from "dato-builder";

const config: DatoBuilderConfig = {
    apiToken: process.env.DATO_API_TOKEN,
    overwriteExistingFields: false,
};

export default config;
```

`dato-builder.config.js`
```javascript
/**
 * @type {import("dato-builder").DatoBuilderConfig}
 */
const config = {
    apiToken: process.env.DATO_API_TOKEN,
    overwriteExistingFields: false,
};

module.exports = config;
```

## Simple Example

`/datocms/blocks/test-block.ts`
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

void TestBlock.create();
```

This will create a new block in DatoCMS with the name "Test Block" and the following fields:

- Title: A heading field
- Description: A textarea field
- Image: An image field with a required validator

To run it you can use the following command:

```bash
npx dato-builder run datocms/blocks/test-block.ts
```

