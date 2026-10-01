import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMarkdown } from "./parse-markdown.ts";

describe("parseMarkdown", () => {
  it("returns an empty list for empty input", () => {
    assert.deepEqual(parseMarkdown(""), []);
    assert.deepEqual(parseMarkdown("\n  \n"), []);
  });

  it("parses names and positions", () => {
    assert.deepEqual(parseMarkdown("- Taro Yamada (CEO)\n- Jiro"), [
      { children: [], department: undefined, name: "Taro Yamada", position: "CEO" },
      { children: [], department: undefined, name: "Jiro", position: undefined },
    ]);
  });

  it("accepts asterisk bullets and ignores non-list lines", () => {
    const nodes = parseMarkdown("# Title\n* A\nplain text\n* B");
    assert.deepEqual(
      nodes.map((node) => node.name),
      ["A", "B"],
    );
  });

  it("nests by indentation", () => {
    const [root] = parseMarkdown("- A\n  - B\n    - C\n  - D");
    assert.equal(root.name, "A");
    assert.deepEqual(
      root.children.map((node) => node.name),
      ["B", "D"],
    );
    assert.equal(root.children[0].children[0].name, "C");
  });

  it("treats bold items as departments and passes them down", () => {
    const [root] = parseMarkdown("- CEO\n  - **Engineering** (Dept)\n    - Ken\n      - Mika");
    const department = root.children[0];
    assert.equal(root.department, undefined);
    assert.equal(department.name, "Engineering");
    assert.equal(department.department, "Engineering");
    assert.equal(department.position, "Dept");
    assert.equal(department.children[0].department, "Engineering");
    assert.equal(department.children[0].children[0].department, "Engineering");
  });

  it("nests tab-indented lists", () => {
    const [root] = parseMarkdown("- A\n\t- B\n\t\t- C");
    assert.equal(root.children[0].name, "B");
    assert.equal(root.children[0].children[0].name, "C");
  });

  it("measures tabs and spaces on the same scale", () => {
    // A tab reaches column 4, so two spaces sit to its left: C is B's sibling.
    const [root] = parseMarkdown("- A\n\t- B\n  - C");
    assert.deepEqual(
      root.children.map((node) => node.name),
      ["B", "C"],
    );
  });

  it("treats a tab and four spaces as the same level", () => {
    const [root] = parseMarkdown("- A\n\t- B\n    - C\n  \t- D");
    assert.deepEqual(
      root.children.map((node) => node.name),
      ["B", "C", "D"],
    );
  });
});
