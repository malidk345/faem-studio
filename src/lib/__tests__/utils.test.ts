import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cn } from "../utils.ts";

describe("cn utility", () => {
  it("merges standard classes correctly", () => {
    assert.equal(cn("class1", "class2"), "class1 class2");
  });

  it("handles conditional classes", () => {
    assert.equal(cn("class1", { "class2": true, "class3": false }), "class1 class2");
  });

  it("handles undefined and null", () => {
    assert.equal(cn("class1", undefined, null, "class2"), "class1 class2");
  });

  it("merges tailwind classes using tailwind-merge", () => {
    // Should remove p-2 and keep p-4
    assert.equal(cn("p-2", "p-4"), "p-4");
  });

  it("merges conditional tailwind classes", () => {
    assert.equal(cn("p-2", { "p-4": true }), "p-4");
    assert.equal(cn("p-2", { "p-4": false }), "p-2");
  });

  it("handles complex combinations of inputs", () => {
    assert.equal(
      cn("text-red-500", ["bg-blue-500", { "p-4": true, "p-2": false }], "text-center", null, undefined, "font-bold text-lg"),
      "text-red-500 bg-blue-500 p-4 text-center font-bold text-lg"
    );
  });
});
