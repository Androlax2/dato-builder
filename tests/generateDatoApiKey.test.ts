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
    expect(generateDatoApiKey("value 2 times")).toBe("value2_time");
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

  describe("suffix format", () => {
    it("ensures suffix is in lowercase", () => {
      expect(generateDatoApiKey("label", "BLOCK")).toBe("label_block");
    });

    it("ensures suffix has no spaces or special characters", () => {
      expect(generateDatoApiKey("label", "special block!")).toBe(
        "label_special_block",
      );
    });

    it("ensures suffix has consistent format with main string", () => {
      expect(generateDatoApiKey("main-part", "suffix-part")).toBe(
        "main_part_suffix_part",
      );
    });

    it("handles empty suffix gracefully", () => {
      expect(generateDatoApiKey("main", "")).toBe("main");
    });
  });

  describe("pluralization handling", () => {
    it("converts regular plural nouns ending with 's' to singular", () => {
      expect(generateDatoApiKey("books")).toBe("book");
      expect(generateDatoApiKey("cats")).toBe("cat");
    });

    it("converts irregular plural nouns to singular", () => {
      expect(generateDatoApiKey("children")).toBe("child");
      expect(generateDatoApiKey("people")).toBe("person");
      expect(generateDatoApiKey("mice")).toBe("mouse");
    });

    it("handles plural nouns with suffix", () => {
      expect(generateDatoApiKey("books", "field")).toBe("book_field");
      expect(generateDatoApiKey("children", "block")).toBe("child_block");
    });

    it("preserves words that end with 's' but aren't plural", () => {
      expect(generateDatoApiKey("analysis")).toBe("analysis");
      expect(generateDatoApiKey("news")).toBe("news");
    });

    it("handles compound plural nouns", () => {
      expect(generateDatoApiKey("book_authors")).toBe("book_author");
      expect(generateDatoApiKey("user profiles")).toBe("user_profile");
    });

    it("handles edge cases with plural-like endings", () => {
      expect(generateDatoApiKey("business")).toBe("business");
      expect(generateDatoApiKey("address")).toBe("address");
      expect(generateDatoApiKey("process")).toBe("process");
    });

    it("handles apostrophes in possessive forms", () => {
      expect(generateDatoApiKey("users' settings")).toBe("user_setting");
      expect(generateDatoApiKey("children's books")).toBe("children_book");
    });
  });
});
