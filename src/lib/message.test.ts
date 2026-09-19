import { describe, expect, it } from "vitest";
import {
  MAX_MESSAGE_LENGTH,
  formatMessageTime,
  validateMessageContent,
} from "./message";

describe("validateMessageContent", () => {
  it("accepts normal messages", () => {
    expect(validateMessageContent("Hello everyone")).toBeNull();
  });

  it("rejects empty and whitespace-only messages", () => {
    expect(validateMessageContent("")).not.toBeNull();
    expect(validateMessageContent("   \n  ")).not.toBeNull();
  });

  it("rejects messages over the limit", () => {
    expect(validateMessageContent("x".repeat(MAX_MESSAGE_LENGTH + 1))).toMatch(
      /1000/,
    );
    expect(validateMessageContent("x".repeat(MAX_MESSAGE_LENGTH))).toBeNull();
  });
});

describe("formatMessageTime", () => {
  it("formats a timestamp for display", () => {
    const formatted = formatMessageTime(new Date(2026, 0, 2, 14, 5).getTime());
    expect(formatted).toMatch(/\d/);
    expect(formatted.length).toBeGreaterThan(0);
  });
});
