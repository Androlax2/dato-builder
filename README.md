# Dato Builder

Quickly create Models, Blocks in DatoCMS from your source code.

## Installation

```bash
npm install --save-dev dato-builder
```

## Configuration

Create a `dato-builder.config.js` or `dato-builder.config.ts` file in the root of your project with the following content:

`dato-builder.config.ts`
```typescript
import type {DatoBuilderConfig} from "./src/config/types";

const config: DatoBuilderConfig = {
    apiToken: "4138815ad42637c8ad7268e303618e",
    overwriteExistingFields: false,
};

export default config;
```
