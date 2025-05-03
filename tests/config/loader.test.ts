import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {afterEach, beforeEach, describe, expect, it, jest,} from "@jest/globals";

describe("Config Loader", () => {
    let tmpDir: string;
    let origCwd: string;

    beforeEach(() => {
        origCwd = process.cwd();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dato-builder-"));
        process.chdir(tmpDir);
    });

    afterEach(() => {
        process.chdir(origCwd);
        fs.rmSync(tmpDir, {recursive: true, force: true});
    });

    it("loads JS config file and applies defaults", () => {
        const cfg = {apiToken: "js-token", overwriteExistingFields: true};
        fs.writeFileSync(
            path.join(tmpDir, "dato-builder.config.js"),
            `module.exports = ${JSON.stringify(cfg)};`,
        );
        const {loadDatoBuilderConfig} = require("../../src/config/loader");
        const loaded = loadDatoBuilderConfig();
        expect(loaded.apiToken).toBe(cfg.apiToken);
        expect(loaded.overwriteExistingFields).toBe(true);
    });

    it("loads TS config file without ts-node warning when ts-node installed", () => {
        const cfg = {apiToken: "ts-token"};
        fs.writeFileSync(
            path.join(tmpDir, "dato-builder.config.ts"),
            `export default ${JSON.stringify(cfg)};`,
        );
        // Simulate ts-node/register available
        jest.resetModules();
        jest.doMock("ts-node/register", () => ({}), {virtual: true});
        const {loadDatoBuilderConfig} = require("../../src/config/loader");
        const loaded = loadDatoBuilderConfig();
        expect(loaded.apiToken).toBe(cfg.apiToken);
        expect(loaded.overwriteExistingFields).toBe(false);
        jest.dontMock("ts-node/register");
    });

    it("throws if no config file exists", () => {
        const {loadDatoBuilderConfig} = require("../../src/config/loader");
        expect(() => loadDatoBuilderConfig()).toThrow(
            /No Dato Builder config found/,
        );
    });
});
