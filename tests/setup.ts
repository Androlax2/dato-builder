// Jest test setup for ESM compatibility
import { basename, dirname, extname, join, resolve } from "node:path";

// Polyfill import.meta.url for ESM tests
Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      url: "file:///test/mock/url",
    },
  },
  writable: true,
  configurable: true,
});

// Ensure __dirname and __filename are available in ESM context
const mockDir = "/test/mock";
Object.defineProperty(globalThis, "__dirname", {
  value: mockDir,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, "__filename", {
  value: `${mockDir}/test.js`,
  writable: true,
  configurable: true,
});

// Ensure path module functions are available globally if needed
Object.defineProperty(globalThis, "path", {
  value: {
    dirname,
    join,
    resolve,
    basename,
    extname,
  },
  writable: true,
  configurable: true,
});
