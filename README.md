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




