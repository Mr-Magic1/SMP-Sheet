"use server";

import dbConnect from "@/lib/db";
import { Topic } from "@/models/Topic";
import { Pattern } from "@/models/Pattern";
import { Problem } from "@/models/Problem";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createWorkspaceTopicAction(title: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const userId = (session.user as any).id;
  const slug = `custom-topic-${userId}-${Date.now()}`;
  
  const newTopic = await Topic.create({
    userId,
    sheetId: `workspace-${userId}`,
    sectionId: 'custom',
    slug,
    title,
    order: 9999, // Custom topics at the end or manage separately
    tier: 'core',
    guidanceMd: '',
    prerequisites: [],
    resources: [],
  });

  // Create a default pattern for this topic
  await Pattern.create({
    userId,
    topicId: newTopic._id,
    slug: `custom-pattern-${userId}-${Date.now()}`,
    title: "General",
    order: 1,
    description: "Your custom questions",
  });

  revalidatePath('/workspace');
  return { success: true };
}

export async function createWorkspaceProblemAction(topicId: string, title: string, url: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const userId = (session.user as any).id;
  
  // Find the first pattern in this topic (we created a default "General" one)
  const pattern = await Pattern.findOne({ topicId, userId });
  if (!pattern) {
    throw new Error("No pattern found in this topic");
  }

  // Derive platform roughly from URL
  let platform: 'leetcode' | 'codeforces' | 'cses' | 'usaco' | 'atcoder' | 'other' = 'other';
  if (url.includes('leetcode.com')) platform = 'leetcode';
  else if (url.includes('codeforces.com')) platform = 'codeforces';
  else if (url.includes('cses.fi')) platform = 'cses';
  else if (url.includes('usaco.guide') || url.includes('usaco.org')) platform = 'usaco';
  else if (url.includes('atcoder.jp')) platform = 'atcoder';

  const slug = `custom-prob-${userId}-${Date.now()}`;
  
  // Find max order in this pattern
  const lastProblem = await Problem.findOne({ patternId: pattern._id }).sort({ order: -1 });
  const order = lastProblem ? lastProblem.order + 1 : 1;

  await Problem.create({
    userId,
    topicId,
    patternId: pattern._id,
    title,
    url,
    platform,
    slug,
    order,
    source: "workspace",
    estimatedMinutes: 30,
    tags: []
  });

  revalidatePath('/workspace');
  return { success: true };
}

export async function deleteWorkspaceTopicAction(topicId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const userId = (session.user as any).id;
  
  // Verify ownership
  const topic = await Topic.findOne({ _id: topicId, userId });
  if (!topic) throw new Error("Topic not found or unauthorized");

  // Delete all problems in this topic
  await Problem.deleteMany({ topicId: topic._id, userId });
  // Delete all patterns in this topic
  await Pattern.deleteMany({ topicId: topic._id, userId });
  // Delete the topic itself
  await Topic.deleteOne({ _id: topic._id, userId });

  revalidatePath('/workspace');
  return { success: true };
}

export async function deleteWorkspaceProblemAction(problemId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const userId = (session.user as any).id;
  
  // Verify ownership and delete
  const result = await Problem.deleteOne({ _id: problemId, userId });
  
  if (result.deletedCount === 0) {
    throw new Error("Problem not found or unauthorized");
  }

  revalidatePath('/workspace');
  return { success: true };
}
