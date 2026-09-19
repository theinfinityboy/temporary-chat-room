import { describe, expect, it } from "vitest";
import {
  createTempUserId,
  normalizeDisplayName,
  validateDisplayName,
} from "./user";

describe("normalizeDisplayName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeDisplayName("  Ada   Lovelace  ")).toBe("Ada Lovelace");
  });
});

describe("validateDisplayName", () => {
  it("accepts normal names", () => {
    expect(validateDisplayName("Alex")).toBeNull();
  });

  it("rejects empty names", () => {
    expect(validateDisplayName("")).not.toBeNull();
    expect(validateDisplayName("    ")).not.toBeNull();
  });

  it("rejects overly long names", () => {
    expect(validateDisplayName("x".repeat(25))).not.toBeNull();
    expect(validateDisplayName("x".repeat(24))).toBeNull();
  });
});

describe("createTempUserId", () => {
  it("creates non-empty unique ids", () => {
    const ids = new Set(Array.from({ length: 20 }, () => createTempUserId()));
    expect(ids.size).toBe(20);
  });
});
