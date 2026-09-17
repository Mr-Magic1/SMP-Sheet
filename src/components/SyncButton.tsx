"use client";

import { useState, useTransition } from "react";
import { syncIntegrationsAction } from "@/actions/sync";
import { RefreshCw } from "lucide-react";

export default function SyncButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleSync = () => {
    setMessage("");
    startTransition(async () => {
      try {
        const res = await syncIntegrationsAction();
        if (res.success) {
          setMessage(`Synced successfully! ${res.count} new problems marked as solved.`);
        } else {
          setMessage(res.message || "Sync failed.");
        }
      } catch (e) {
        setMessage("An error occurred during sync.");
      }
    });
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleSync}
        disabled={isPending}
        className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium hover:bg-secondary/80 transition disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Syncing..." : "Sync External Platforms"}
      </button>
      {message && <p className="text-sm mt-2 text-muted-foreground">{message}</p>}
    </div>
  );
}
