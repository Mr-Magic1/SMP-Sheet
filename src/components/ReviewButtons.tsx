"use client";

import { useState, useTransition } from "react";
import { reviewCardAction } from "@/actions/revision";

export default function ReviewButtons({ problemId }: { problemId: string }) {
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);

  const handleReview = (quality: number) => {
    startTransition(async () => {
      try {
        await reviewCardAction(problemId, quality);
        setCompleted(true);
      } catch (e) {
        console.error("Failed to submit review", e);
      }
    });
  };

  if (completed) {
    return <div className="text-green-500 font-medium">Reviewed! Scheduled for next time.</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium mr-2">Recall Quality:</span>
      {[
        { q: 0, label: "0 - Blackout", color: "bg-red-500 hover:bg-red-600" },
        { q: 1, label: "1 - Wrong", color: "bg-orange-500 hover:bg-orange-600" },
        { q: 2, label: "2 - Hard", color: "bg-amber-500 hover:bg-amber-600" },
        { q: 3, label: "3 - Okay", color: "bg-yellow-500 hover:bg-yellow-600 text-black" },
        { q: 4, label: "4 - Good", color: "bg-lime-500 hover:bg-lime-600 text-black" },
        { q: 5, label: "5 - Perfect", color: "bg-green-500 hover:bg-green-600 text-white" },
      ].map(({ q, label, color }) => (
        <button
          key={q}
          disabled={isPending}
          onClick={() => handleReview(q)}
          className={`px-3 py-1 text-xs rounded font-semibold transition-colors disabled:opacity-50 ${color} text-white`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
