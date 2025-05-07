import { describe, expect, it } from "@jest/globals";
import { generateDatoApiKey } from "../src/utils/utils";

describe("generateDatoApiKey", () => {
  it("lowercases and replaces non-alphanumerics with underscores", () => {
    expect(generateDatoApiKey({ name: "Hello World!" })).toBe("hello_world");
  });

  it("collapses multiple underscores into one", () => {
    expect(generateDatoApiKey({ name: "foo--bar__baz" })).toBe("foo_bar_baz");
  });

  it("removes underscore before digits", () => {
    expect(generateDatoApiKey({ name: "value 2 times" })).toBe("value2_times");
    expect(generateDatoApiKey({ name: "test_3_field" })).toBe("test3_field");
  });

  it("trims leading and trailing underscores", () => {
    expect(generateDatoApiKey({ name: "__example__" })).toBe("example");
  });

  it("appends suffix when provided", () => {
    expect(generateDatoApiKey({ name: "label", suffix: "block" })).toBe(
      "label_block",
    );
  });

  it("handles numeric-only names", () => {
    expect(generateDatoApiKey({ name: "123 456" })).toBe("123456");
  });

  it("handles empty strings gracefully", () => {
    expect(generateDatoApiKey({ name: "   " })).toBe("");
    expect(generateDatoApiKey({ name: "", suffix: "sfx" })).toBe("_sfx");
  });

  it("does not introduce multiple underscores when suffix added", () => {
    expect(generateDatoApiKey({ name: "name_", suffix: "suffix" })).toBe(
      "name_suffix",
    );
  });

  describe("suffix format", () => {
    it("ensures suffix is in lowercase", () => {
      expect(generateDatoApiKey({ name: "label", suffix: "BLOCK" })).toBe(
        "label_block",
      );
    });

    it("ensures suffix has no spaces or special characters", () => {
      expect(
        generateDatoApiKey({ name: "label", suffix: "special block!" }),
      ).toBe("label_special_block");
    });

    it("ensures suffix has consistent format with main string", () => {
      expect(
        generateDatoApiKey({ name: "main-part", suffix: "suffix-part" }),
      ).toBe("main_part_suffix_part");
    });

    it("handles empty suffix gracefully", () => {
      expect(generateDatoApiKey({ name: "main", suffix: "" })).toBe("main");
    });
  });

  describe("pluralization (default behavior: preserve plural)", () => {
    it("preserves regular plural nouns", () => {
      expect(generateDatoApiKey({ name: "books" })).toBe("books");
      expect(generateDatoApiKey({ name: "cats" })).toBe("cats");
    });

    it("preserves irregular plural nouns", () => {
      expect(generateDatoApiKey({ name: "children" })).toBe("children");
      expect(generateDatoApiKey({ name: "people" })).toBe("people");
      expect(generateDatoApiKey({ name: "mice" })).toBe("mice");
    });

    it("preserves compound plural nouns", () => {
      expect(generateDatoApiKey({ name: "book_authors" })).toBe("book_authors");
      expect(generateDatoApiKey({ name: "user profiles" })).toBe(
        "user_profiles",
      );
    });

    it("preserves edge-case plural-looking endings", () => {
      expect(generateDatoApiKey({ name: "business" })).toBe("business");
      expect(generateDatoApiKey({ name: "address" })).toBe("address");
      expect(generateDatoApiKey({ name: "process" })).toBe("process");
    });

    it("preserves possessive forms", () => {
      expect(generateDatoApiKey({ name: "users' settings" })).toBe(
        "users_settings",
      );
      expect(generateDatoApiKey({ name: "children's books" })).toBe(
        "childrens_books",
      );
    });

    it("preserves plural nouns with suffix", () => {
      expect(generateDatoApiKey({ name: "books", suffix: "field" })).toBe(
        "books_field",
      );
      expect(generateDatoApiKey({ name: "children", suffix: "block" })).toBe(
        "children_block",
      );
    });
  });

  describe("preservePlural: false (force singular)", () => {
    it("converts regular plural nouns ending with 's' to singular", () => {
      expect(generateDatoApiKey({ name: "books", preservePlural: false })).toBe(
        "book",
      );
      expect(generateDatoApiKey({ name: "cats", preservePlural: false })).toBe(
        "cat",
      );
    });

    it("converts irregular plural nouns to singular", () => {
      expect(
        generateDatoApiKey({ name: "children", preservePlural: false }),
      ).toBe("child");
      expect(
        generateDatoApiKey({ name: "people", preservePlural: false }),
      ).toBe("person");
      expect(generateDatoApiKey({ name: "mice", preservePlural: false })).toBe(
        "mouse",
      );
    });

    it("singularizes compound names", () => {
      expect(
        generateDatoApiKey({ name: "user profiles", preservePlural: false }),
      ).toBe("user_profile");
    });

    it("handles suffix with singularization", () => {
      expect(
        generateDatoApiKey({
          name: "books",
          suffix: "field",
          preservePlural: false,
        }),
      ).toBe("book_field");
    });

    it("does not incorrectly singularize singular-looking endings", () => {
      expect(
        generateDatoApiKey({ name: "analysis", preservePlural: false }),
      ).toBe("analysis");
      expect(generateDatoApiKey({ name: "news", preservePlural: false })).toBe(
        "news",
      );
      expect(
        generateDatoApiKey({ name: "address", preservePlural: false }),
      ).toBe("address");
    });

    it("removes apostrophes and singularizes possessives", () => {
      expect(
        generateDatoApiKey({ name: "users' settings", preservePlural: false }),
      ).toBe("user_setting");
      expect(
        generateDatoApiKey({ name: "children's books", preservePlural: false }),
      ).toBe("children_book");
    });
  });
});
