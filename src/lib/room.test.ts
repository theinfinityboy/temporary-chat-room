import { describe, expect, it } from "vitest";
import {
  ROOM_CODE_LENGTH,
  ROOM_CODE_PATTERN,
  generateRoomId,
  isValidRoomId,
  normalizeRoomId,
  validateRoomId,
} from "./room";

describe("generateRoomId", () => {
  it("produces codes of the right length and charset", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomId();
      expect(code).toHaveLength(ROOM_CODE_LENGTH);
      expect(code).toMatch(ROOM_CODE_PATTERN);
    }
  });

  it("avoids confusable characters", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateRoomId()).not.toMatch(/[ILO01]/);
    }
  });

  it("generates distinct codes", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateRoomId()));
    expect(codes.size).toBeGreaterThan(40);
  });
});

describe("normalizeRoomId", () => {
  it("uppercases, trims, and strips separators", () => {
    expect(normalizeRoomId("  x7k-29p ")).toBe("X7K29P");
  });

  it("caps length at 6 characters", () => {
    expect(normalizeRoomId("ABCDEFGH")).toBe("ABCDEF");
  });
});

describe("isValidRoomId / validateRoomId", () => {
  it("accepts valid codes case-insensitively", () => {
    expect(isValidRoomId("X7K29P")).toBe(true);
    expect(isValidRoomId("x7k29p")).toBe(true);
    expect(validateRoomId("X7K29P")).toBeNull();
  });

  it("rejects empty, short, and malformed codes", () => {
    expect(validateRoomId("")).toMatch(/room code/i);
    expect(validateRoomId("AB12")).toMatch(/6/);
    expect(validateRoomId("!!!!!!")).toMatch(/6/);
  });
});
