"use server";

import dbConnect from "@/lib/db";
import { Progress } from "@/models/Progress";
import { ActivityLog } from "@/models/ActivityLog";
import { User } from "@/models/User";
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

  const oldProgress = await Progress.findOne({ userId, problemId }).lean();
  const wasSolved = oldProgress?.status === 'solved';

  // Find or create progress
  const progress = await Progress.findOneAndUpdate(
    { userId, problemId },
    {
      $set: { ...updatePayload },
      $setOnInsert: { firstAttemptedAt: new Date() },
      // Increment attempts if status changes to attempting
    },
    { upsert: true, returnDocument: 'after' }
  );

  // If status is attempting, increment attempts counter
  if (status === 'attempting') {
    await Progress.updateOne(
      { _id: progress._id },
      { $inc: { attempts: 1 } }
    );
  }

  // Update ActivityLog if newly solved
  if (status === 'solved' && !wasSolved) {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    
    await ActivityLog.findOneAndUpdate(
      { userId, date: localISOTime },
      { $inc: { solvedCount: 1 } },
      { upsert: true }
    );
    
    // Streak logic
    const user = await User.findById(userId);
    if (user) {
      const lastActive = user.streak?.lastActiveDate;
      let newCurrent = user.streak?.current || 0;
      let newLongest = user.streak?.longest || 0;

      // Calculate yesterday's date string
      const yesterday = new Date(Date.now() - 86400000 - tzOffset);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActive === yesterdayStr) {
        // Solved yesterday, increment streak
        newCurrent += 1;
      } else if (lastActive !== localISOTime) {
        // Missed yesterday (and not already solved today), streak resets to 1
        newCurrent = 1;
      }
      // If lastActive === localISOTime, streak stays the same

      if (newCurrent > newLongest) {
        newLongest = newCurrent;
      }

      await User.findByIdAndUpdate(userId, {
        $set: {
          'streak.current': newCurrent,
          'streak.longest': newLongest,
          'streak.lastActiveDate': localISOTime
        }
      });
    }
  }

  // PRD: "No automatic, silent additions."
  // Auto-add feature removed.

  revalidatePath('/sheet');
  revalidatePath('/profile');
  
  return { success: true };
}

