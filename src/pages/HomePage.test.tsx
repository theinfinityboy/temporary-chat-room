import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "./HomePage";
import RoomPage from "./RoomPage";
import { useChatStore } from "@/stores/useChatStore";
import { useIdentityStore } from "@/stores/useIdentityStore";
import { useParticipantStore } from "@/stores/useParticipantStore";
import { useRoomStore } from "@/stores/useRoomStore";

function renderApp() {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  useIdentityStore.setState({ user: null });
  useChatStore.setState({ messagesByRoom: {} });
  useParticipantStore.setState({ participantsByRoom: {} });
  useRoomStore.setState({ room: null, connection: "idle", error: null });
});

describe("HomePage create-room flow", () => {
  it("creates a room and navigates to it", async () => {
    const user = userEvent.setup();
    renderApp();

    const nameInput = document.getElementById("create-name");
    if (!nameInput) throw new Error("create-name input missing");
    await user.type(nameInput, "Alex");
    await user.click(screen.getByRole("button", { name: /create room/i }));

    // Room shell renders: chat landmark + live connection status.
    expect(await screen.findByLabelText("Chat")).toBeInTheDocument();
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("blocks creation with an empty display name", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: /create room/i }));
    expect(await screen.findByText("Enter a display name.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Chat")).toBeNull();
  });
});

describe("HomePage join-room flow", () => {
  it("rejects an invalid room code", async () => {
    const user = userEvent.setup();
    renderApp();

    const nameInput = document.getElementById("join-name");
    const codeInput = document.getElementById("join-code");
    if (!nameInput || !codeInput) throw new Error("join inputs missing");
    await user.type(nameInput, "Sam");
    await user.type(codeInput, "AB12");
    await user.click(screen.getByRole("button", { name: /join room/i }));

    expect(await screen.findByText(/room codes are/i)).toBeInTheDocument();
  });

  it("joins with a valid code and name", async () => {
    const user = userEvent.setup();
    renderApp();

    const nameInput = document.getElementById("join-name");
    const codeInput = document.getElementById("join-code");
    if (!nameInput || !codeInput) throw new Error("join inputs missing");
    await user.type(nameInput, "Sam");
    await user.type(codeInput, "X7K29P");
    await user.click(screen.getByRole("button", { name: /join room/i }));

    expect(await screen.findByText("X7K29P")).toBeInTheDocument();
  });
});
