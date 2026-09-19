import { Toaster as SonnerToaster } from "sonner";

/** App-wide toast outlet. Render once near the root. */
function Toaster() {
  return <SonnerToaster position="bottom-center" gap={8} />;
}

export { Toaster };
