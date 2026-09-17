import dbConnect from '@/lib/db';
import { Topic } from '@/models/Topic';
import { Pattern } from '@/models/Pattern';
import { Problem } from '@/models/Problem';
import { Progress } from '@/models/Progress';
import { Resource } from '@/models/Resource';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import SheetClient from './SheetClient';

export const revalidate = 0;

async function getSheetData() {
  await dbConnect();

  const topics = await Topic.find({}).sort({ order: 1 }).lean();
  const patterns = await Pattern.find({}).sort({ order: 1 }).lean();
  const problems = await Problem.find({}).sort({ order: 1 }).lean();
  const resources = await Resource.find({}).lean();

  return { topics, patterns, problems, resources };
}

async function getUserProgress() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return {};

  await dbConnect();
  const userId = (session.user as any).id;
  const progressDocs = await Progress.find({ userId }).lean();

  const progressMap: Record<string, string> = {};
  progressDocs.forEach((p) => {
    progressMap[p.problemId.toString()] = p.status;
  });

  return progressMap;
}

export default async function SheetPage() {
  const { topics, patterns, problems, resources } = await getSheetData();
  const userProgress = await getUserProgress();

  // Serialize for client
  const data = topics.map((topic: any) => ({
    id: topic._id.toString(),
    title: topic.title,
    resources: resources
      .filter((r: any) => r.ownerId.toString() === topic._id.toString())
      .map((r: any) => ({ id: r._id.toString(), kind: r.kind, title: r.title, url: r.url })),
    patterns: patterns
      .filter((p: any) => p.topicId.toString() === topic._id.toString())
      .map((pat: any) => ({
        id: pat._id.toString(),
        title: pat.title,
        problems: problems
          .filter((pr: any) => pr.patternId.toString() === pat._id.toString())
          .map((pr: any) => ({
            id: pr._id.toString(),
            title: pr.title,
            url: pr.url,
            platform: pr.platform,
            status: userProgress[pr._id.toString()] || 'todo',
          })),
      })),
  }));

  const totalProblems = problems.length;
  const solvedProblems = Object.values(userProgress).filter((s) => s === 'solved').length;

  return <SheetClient data={data} totalProblems={totalProblems} solvedProblems={solvedProblems} />;
}
