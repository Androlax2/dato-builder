import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

describe("Config", () => {
  let tmpDir: string;
  let origCwd: string;

  beforeEach(() => {
    origCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dato-builder-"));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("throws for missing apiToken", () => {
    fs.writeFileSync(
      path.join(tmpDir, "dato-builder.config.js"),
      "module.exports = { overwriteExistingFields: false };",
    );
    const { loadDatoBuilderConfig } = require("../../src/config/loader");
    expect(() => loadDatoBuilderConfig()).toThrow(/API token is required/);
  });

  it("sets overwriteExistingFields to false by default", () => {
    fs.writeFileSync(
      path.join(tmpDir, "dato-builder.config.js"),
      "module.exports = { apiToken: 'token' };",
    );
    const { loadDatoBuilderConfig } = require("../../src/config/loader");
    const config = loadDatoBuilderConfig();
    expect(config.overwriteExistingFields).toBe(false);
  });
});
