import { describe, expect, it } from "vitest";
import { displayElapsedSeconds } from "../src/modules/shared/elapsed.js";
import { isBlankName, trimName } from "../src/modules/shared/names.js";

describe("trimName / isBlankName", () => {
  it("trims end spaces for lookup and store (AC-11)", () => {
    expect(trimName("  Homework  ")).toBe("Homework");
  });

  it("treats capital and small letters as different (AC-11)", () => {
    expect(trimName("Homework")).not.toBe(trimName("homework"));
  });

  it("rejects empty and whitespace-only names (AC-04, AC-10)", () => {
    expect(isBlankName("")).toBe(true);
    expect(isBlankName("   ")).toBe(true);
    expect(isBlankName("done")).toBe(false);
  });
});

describe("displayElapsedSeconds", () => {
  it("equals elapsed only when visible_started_at is null (AC-15)", () => {
    expect(displayElapsedSeconds(42, null, new Date("2026-10-31T12:00:00.000Z"))).toBe(42);
  });

  it("adds whole seconds since visible_started_at when set (AC-15)", () => {
    const now = new Date("2026-10-31T12:00:10.000Z");
    expect(displayElapsedSeconds(5, "2026-10-31T12:00:00.000Z", now)).toBe(15);
  });
});
