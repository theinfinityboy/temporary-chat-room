import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";

const MESSAGE: ChatMessageType = {
  id: "m1",
  roomId: "X7K29P",
  senderId: "u2",
  senderName: "Sam",
  content: "Hello there",
  createdAt: new Date(2026, 0, 2, 14, 5).getTime(),
};

describe("ChatMessage", () => {
  it("renders sender, content, and time", () => {
    render(<ChatMessage message={MESSAGE} isOwn={false} />);
    expect(screen.getByText("Sam")).toBeInTheDocument();
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Sam"),
    );
  });

  it("renders message HTML as inert text, never as markup", () => {
    const { container } = render(
      <ChatMessage
        message={{ ...MESSAGE, content: "<img src=x onerror=alert(1)>hi" }}
        isOwn={false}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>hi")).toBeInTheDocument();
  });

  it("exposes a machine-readable timestamp", () => {
    render(<ChatMessage message={MESSAGE} isOwn={true} />);
    expect(screen.getByRole("time")).toHaveAttribute("dateTime");
  });
});
