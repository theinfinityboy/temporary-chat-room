import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";

// Split the room bundle off the landing page so first paint stays light.
const RoomPage = lazy(() => import("@/pages/RoomPage"));

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <p role="status" className="text-sm text-muted-foreground">
            Loading…
          </p>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
}
