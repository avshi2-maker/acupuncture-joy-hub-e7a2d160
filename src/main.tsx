import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// New approach: remove any previously-installed Service Worker + caches (from older PWA builds)
// so users stop seeing stale pages after publishing.
(async () => {
  try {
    const url = new URL(window.location.href);
    const alreadyCleared = url.searchParams.get("swcleared") === "1";

    if (!alreadyCleared) {
      let didAnything = false;

      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (regs.length) {
          await Promise.all(regs.map((r) => r.unregister()));
          didAnything = true;
        }
      }

      if ("caches" in window) {
        const keys = await caches.keys();
        if (keys.length) {
          await Promise.all(keys.map((k) => caches.delete(k)));
          didAnything = true;
        }
      }

      if (didAnything) {
        url.searchParams.set("swcleared", "1");
        url.searchParams.set("v", String(Date.now()));
        window.location.replace(url.toString());
        return;
      }
    }
  } catch {
    // ignore
  }

  createRoot(document.getElementById("root")!).render(<App />);
})();

