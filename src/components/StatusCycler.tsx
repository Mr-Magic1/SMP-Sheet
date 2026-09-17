"use client";

import { useState, useTransition } from "react";
import { updateProgressAction } from "@/actions/progress";
import { CheckCircle2, CircleDashed, Clock, XCircle, RefreshCw } from "lucide-react";
import { useProgressStore } from "@/store/progress";
import { useSession } from "next-auth/react";

type Status = "todo" | "attempting" | "stuck" | "solved" | "revisit";

const statuses: Status[] = ["todo", "attempting", "stuck", "solved"];

const statusConfig = {
  todo: {
    icon: CircleDashed,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    label: "To Do"
  },
  attempting: {
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    label: "Attempting"
  },
  stuck: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Stuck"
  },
  solved: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    label: "Solved"
  },
  revisit: {
    icon: RefreshCw,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Revisit"
  }
};

interface StatusCyclerProps {
  problemId: string;
  initialStatus?: Status;
}

export default function StatusCycler({ problemId, initialStatus = "todo" }: StatusCyclerProps) {
  const { data: session } = useSession();
  const guestProgress = useProgressStore((state) => state.progress[problemId]);
  const setGuestProgress = useProgressStore((state) => state.setProgress);
  
  // If guest, use local state; if logged in, use server state
  const isGuest = !session?.user;
  const currentStatus = isGuest 
    ? (guestProgress?.status || "todo") 
    : initialStatus;

  const [optimisticStatus, setOptimisticStatus] = useState<Status>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleCycle = () => {
    const currentIndex = statuses.indexOf(optimisticStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    setOptimisticStatus(nextStatus);
    
    if (isGuest) {
      setGuestProgress(problemId, nextStatus);
    } else {
      startTransition(async () => {
        try {
          await updateProgressAction(problemId, nextStatus);
        } catch (e) {
          console.error("Failed to update status", e);
          setOptimisticStatus(currentStatus); // revert
        }
      });
    }
  };

  const config = statusConfig[optimisticStatus];
  const Icon = config.icon;

  return (
    <button
      onClick={handleCycle}
      disabled={isPending}
      className={`flex items-center justify-center p-2 rounded-md transition-all hover:bg-accent ${config.color} ${config.bg} ${isPending ? 'opacity-50' : ''}`}
      title={config.label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
