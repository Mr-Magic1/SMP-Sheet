import dbConnect from '@/lib/db';
import { Topic } from '@/models/Topic';
import { Pattern } from '@/models/Pattern';
import { Problem } from '@/models/Problem';
import { Progress } from '@/models/Progress';
import { Resource } from '@/models/Resource';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import SheetClient from './SheetClient';
import { unstable_cache } from 'next/cache';

const getCachedSheetData = unstable_cache(
  async () => {
    await dbConnect();

    const topics = await Topic.find({}).sort({ order: 1 }).lean();
    const patterns = await Pattern.find({}).sort({ order: 1 }).lean();
    const problems = await Problem.find({}).sort({ order: 1 }).lean();
    const resources = await Resource.find({}).lean();

    return {
      topics: JSON.parse(JSON.stringify(topics)),
      patterns: JSON.parse(JSON.stringify(patterns)),
      problems: JSON.parse(JSON.stringify(problems)),
      resources: JSON.parse(JSON.stringify(resources)),
    };
  },
  ['sheet-static-data-v1'],
  { revalidate: 3600 * 24 } // cache for 24 hours
);

async function getUserProgress() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return {};

  await dbConnect();
  const userId = (session.user as any).id;
  const progressDocs = await Progress.find({ userId }).lean();

  const progressMap: Record<string, string> = {};
  progressDocs.forEach((p: any) => {
    progressMap[p.problemId.toString()] = p.status;
  });

  return progressMap;
}

export default async function SheetPage() {
  const { topics, patterns, problems, resources } = await getCachedSheetData();
  const userProgress = await getUserProgress();

  // Grouping for O(1) lookups
  const resourcesByTopic: Record<string, any[]> = {};
  resources.forEach((r: any) => {
    const rid = (r.topicId || r.ownerId)?.toString();
    if (!rid) return;
    if (!resourcesByTopic[rid]) resourcesByTopic[rid] = [];
    resourcesByTopic[rid].push({ id: r._id.toString(), kind: r.kind, title: r.title, url: r.url || '#' });
  });

  const problemsByPattern: Record<string, any[]> = {};
  problems.forEach((pr: any) => {
    const pid = pr.patternId.toString();
    if (!problemsByPattern[pid]) problemsByPattern[pid] = [];
    problemsByPattern[pid].push({
      id: pr._id.toString(),
      title: pr.title,
      url: pr.url,
      platform: pr.platform,
      status: userProgress[pr._id.toString()] || 'todo',
    });
  });

  const patternsByTopic: Record<string, any[]> = {};
  patterns.forEach((pat: any) => {
    const tid = pat.topicId.toString();
    if (!patternsByTopic[tid]) patternsByTopic[tid] = [];
    patternsByTopic[tid].push({
      id: pat._id.toString(),
      title: pat.title,
      problems: problemsByPattern[pat._id.toString()] || [],
    });
  });

  // Serialize for client
  const data = topics.map((topic: any) => {
    const tid = topic._id.toString();
    return {
      id: tid,
      title: topic.title,
      resources: resourcesByTopic[tid] || [],
      patterns: patternsByTopic[tid] || [],
    };
  });

  const totalProblems = problems.length;
  let solvedProblems = 0;
  problems.forEach((pr: any) => {
    if (userProgress[pr._id.toString()] === 'solved') {
      solvedProblems++;
    }
  });

  return <SheetClient data={data} totalProblems={totalProblems} solvedProblems={solvedProblems} />;
}
