import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Ensure published updates reliably reach users (especially installed PWA)
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    // Proactively check for an update on load
    registration?.update().catch(() => undefined);
  },
  onNeedRefresh() {
    toast("New version available", {
      description: "Tap Reload to update.",
      duration: Infinity,
      action: {
        label: "Reload",
        onClick: () => updateSW(true),
      },
    });
  },
  onOfflineReady() {
    // Optional: keep quiet to avoid noise
  },
});


createRoot(document.getElementById("root")!).render(<App />);

