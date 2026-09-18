"use server";

import dbConnect from "@/lib/db";
import { Progress } from "@/models/Progress";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function updateProgressAction(
  problemId: string,
  status: 'todo' | 'attempting' | 'solved' | 'stuck' | 'revisit',
  timeSpentSec?: number,
  difficultyFelt?: number,
  usedEditorial?: boolean
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  await dbConnect();

  const userId = (session.user as any).id;

  const updatePayload: any = { status };
  
  if (status === 'solved') {
    updatePayload.solvedAt = new Date();
  }
  
  if (timeSpentSec !== undefined) {
    updatePayload.$inc = { timeSpentSec: timeSpentSec };
  }
  
  if (difficultyFelt !== undefined) {
    updatePayload.difficultyFelt = difficultyFelt;
  }

  if (usedEditorial !== undefined) {
    updatePayload.usedEditorial = usedEditorial;
  }

  // Find or create progress
  const progress = await Progress.findOneAndUpdate(
    { userId, problemId },
    {
      $set: { ...updatePayload },
      $setOnInsert: { firstAttemptedAt: new Date() },
      // Increment attempts if status changes to attempting
    },
    { upsert: true, new: true }
  );

  // If status is attempting, increment attempts counter
  if (status === 'attempting') {
    await Progress.updateOne(
      { _id: progress._id },
      { $inc: { attempts: 1 } }
    );
  }

  // PRD: "No automatic, silent additions."
  // Auto-add feature removed.

  revalidatePath('/sheet');
  revalidatePath('/profile');
  
  return { success: true, progress: progress.toJSON() };
}

