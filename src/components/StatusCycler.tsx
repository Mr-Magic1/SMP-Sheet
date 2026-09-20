"use client";

import { useTransition } from "react";
import { updateProgressAction } from "@/actions/progress";
import { CheckCircle2, CircleDashed, Clock, XCircle, RefreshCw } from "lucide-react";
import { useProgressStore } from "@/store/progress";
import { useOptimisticProgressStore } from "@/store/optimistic";
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
  const setGuestProgress = useProgressStore((state) => state.setProgress);
  const setOverride = useOptimisticProgressStore((state) => state.setOverride);
  
  const isGuest = !session?.user;
  const [isPending, startTransition] = useTransition();

  const handleCycle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentIndex = statuses.indexOf(initialStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    if (isGuest) {
      setGuestProgress(problemId, nextStatus);
    } else {
      setOverride(problemId, nextStatus);
      startTransition(() => {
        updateProgressAction(problemId, nextStatus).catch(err => {
          console.error("Failed to update status", err);
        });
      });
    }
  };

  const config = statusConfig[initialStatus] || statusConfig.todo;
  const Icon = config.icon;

  return (
    <button
      onClick={handleCycle}
      className={`flex items-center justify-center p-2 rounded-md transition-all hover:bg-accent ${config.color} ${config.bg} ${isPending ? 'opacity-70' : ''}`}
      title={config.label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
