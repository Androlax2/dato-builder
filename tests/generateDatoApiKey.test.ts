import { describe, expect, it } from "@jest/globals";
import { generateDatoApiKey } from "../src/utils/utils";

describe("generateDatoApiKey", () => {
  it("lowercases and replaces non-alphanumerics with underscores", () => {
    expect(generateDatoApiKey("Hello World!")).toBe("hello_world");
  });

  it("collapses multiple underscores into one", () => {
    expect(generateDatoApiKey("foo--bar__baz")).toBe("foo_bar_baz");
  });

  it("removes underscore before digits", () => {
    expect(generateDatoApiKey("value 2 times")).toBe("value2_times");
    expect(generateDatoApiKey("test_3_field")).toBe("test3_field");
  });

  it("trims leading and trailing underscores", () => {
    expect(generateDatoApiKey("__example__")).toBe("example");
  });

  it("appends suffix when provided", () => {
    expect(generateDatoApiKey("label", "block")).toBe("label_block");
  });

  it("handles numeric-only names", () => {
    expect(generateDatoApiKey("123 456")).toBe("123456");
  });

  it("handles empty strings gracefully", () => {
    expect(generateDatoApiKey("   ")).toBe("");
    expect(generateDatoApiKey("", "sfx")).toBe("_sfx");
  });

  it("does not introduce multiple underscores when suffix added", () => {
    expect(generateDatoApiKey("name_", "suffix")).toBe("name_suffix");
  });
});
