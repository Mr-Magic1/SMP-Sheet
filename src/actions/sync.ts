"use server";

import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Progress } from "@/models/Progress";
import { Problem } from "@/models/Problem";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function fetchCodeforcesStatus(handle: string) {
  try {
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const data = await res.json();
    if (data.status === "OK") {
      // Filter for OK (Accepted) submissions
      return data.result
        .filter((sub: any) => sub.verdict === "OK")
        .map((sub: any) => `${sub.problem.contestId}${sub.problem.index}`); // e.g., 123A
    }
  } catch (e) {
    console.error("Codeforces sync error:", e);
  }
  return [];
}

async function fetchLeetCodeStatus(handle: string) {
  // LeetCode GraphQL query for user profile recent submissions (or AC count)
  // Since getting all solved slugs from LC is complex without auth cookies,
  // we'll do a simple mock or use a public API wrapper if available.
  // For demonstration, we'll hit the ALFA LeetCode API wrapper if available,
  // or return an empty array.
  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}/acSubmission`);
    if (res.ok) {
      const data = await res.json();
      return data.submission.map((sub: any) => sub.titleSlug);
    }
  } catch (e) {
    console.error("LeetCode sync error:", e);
  }
  return [];
}

export async function syncIntegrationsAction() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const userId = (session.user as any).id;
  const user = await User.findById(userId);

  if (!user || !user.handles) return { success: false, message: "No handles linked." };

  let syncedCount = 0;

  // Codeforces Sync
  if (user.handles.codeforces) {
    const cfSolved = await fetchCodeforcesStatus(user.handles.codeforces);
    if (cfSolved.length > 0) {
      const cfProblems = await Problem.find({ platform: 'codeforces' });
      for (const p of cfProblems) {
        // CF slug is usually like "123/A" or "123-A" in our DB. We'll do a loose match.
        const normalizedSlug = p.slug.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const solvedMatch = cfSolved.find((s: string) => s.toLowerCase() === normalizedSlug);
        
        if (solvedMatch) {
          const prog = await Progress.findOneAndUpdate(
            { userId, problemId: p._id },
            { $set: { status: 'solved', solvedAt: new Date() } },
            { upsert: true, new: false }
          );
          if (!prog || prog.status !== 'solved') syncedCount++;
        }
      }
    }
  }

  // LeetCode Sync
  if (user.handles.leetcode) {
    const lcSolvedSlugs = await fetchLeetCodeStatus(user.handles.leetcode);
    if (lcSolvedSlugs.length > 0) {
      const lcProblems = await Problem.find({ platform: 'leetcode' });
      for (const p of lcProblems) {
        if (lcSolvedSlugs.includes(p.slug)) {
          const prog = await Progress.findOneAndUpdate(
            { userId, problemId: p._id },
            { $set: { status: 'solved', solvedAt: new Date() } },
            { upsert: true, new: false }
          );
          if (!prog || prog.status !== 'solved') syncedCount++;
        }
      }
    }
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  revalidatePath('/sheet');

  return { success: true, count: syncedCount };
}
