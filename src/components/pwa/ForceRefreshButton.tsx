import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

async function clearServiceWorkersAndCaches() {
  // Unregister service workers (PWA)
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }

  // Clear CacheStorage
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
}

export default function ForceRefreshButton() {
  const [busy, setBusy] = useState(false);

  const handleForceRefresh = async () => {
    if (busy) return;
    setBusy(true);

    toast("Forcing an update…", {
      description: "Clearing cached files and reloading.",
      duration: 2500,
    });

    try {
      await clearServiceWorkersAndCaches();
    } finally {
      // Cache-busting reload
      const url = new URL(window.location.href);
      url.searchParams.set("v", String(Date.now()));
      window.location.replace(url.toString());
    }
  };

  return (
    <Button
      type="button"
      variant="link"
      size="sm"
      className="h-auto px-0 text-primary-foreground/70 hover:text-primary-foreground"
      onClick={handleForceRefresh}
      disabled={busy}
    >
      <span className="inline-flex items-center gap-2">
        <RefreshCw className={"h-4 w-4" + (busy ? " animate-spin" : "")} />
        Force refresh
      </span>
    </Button>
  );
}
