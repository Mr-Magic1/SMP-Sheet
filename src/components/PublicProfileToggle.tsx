"use client";

import { useTransition } from "react";
import { togglePublicProfileAction } from "@/actions/settings";
import { Globe, Lock } from "lucide-react";

export default function PublicProfileToggle({ initialIsPublic }: { initialIsPublic: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await togglePublicProfileAction();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition disabled:opacity-50 border ${
        initialIsPublic 
          ? "border-green-500 text-green-500 hover:bg-green-500/10" 
          : "border-muted text-muted-foreground hover:bg-muted/10"
      }`}
    >
      {initialIsPublic ? (
        <>
          <Globe className="w-4 h-4" /> Public Profile Active
        </>
      ) : (
        <>
          <Lock className="w-4 h-4" /> Profile is Private
        </>
      )}
    </button>
  );
}
