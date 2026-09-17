"use server";

import dbConnect from "@/lib/db";
import { RevisionCard } from "@/models/RevisionCard";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// SM-2 Algorithm Implementation
function calculateSM2(quality: number, ease: number, interval: number, reps: number) {
  let newEase = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;

  let newInterval = interval;
  let newReps = reps;

  if (quality < 3) {
    newReps = 0;
    newInterval = 1;
  } else {
    newReps += 1;
    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEase);
    }
  }

  return { newEase, newInterval, newReps };
}

export async function reviewCardAction(problemId: string, quality: number) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  if (quality < 0 || quality > 5) {
    throw new Error("Quality must be between 0 and 5");
  }

  await dbConnect();
  const userId = (session.user as any).id;

  const card = await RevisionCard.findOne({ userId, problemId });

  let ease = 2.5;
  let interval = 0;
  let reps = 0;
  let lapses = 0;

  if (card) {
    ease = card.ease;
    interval = card.intervalDays;
    reps = card.reps;
    lapses = card.lapses;
  }

  const { newEase, newInterval, newReps } = calculateSM2(quality, ease, interval, reps);
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + newInterval);

  await RevisionCard.findOneAndUpdate(
    { userId, problemId },
    {
      ease: newEase,
      intervalDays: newInterval,
      dueDate,
      reps: newReps,
      lapses: quality < 3 ? lapses + 1 : lapses,
      lastReviewedAt: new Date(),
    },
    { upsert: true }
  );

  revalidatePath('/revise');
  return { success: true };
}
