import dbConnect from '@/lib/db';
import { Topic } from '@/models/Topic';
import { Pattern } from '@/models/Pattern';
import { Problem } from '@/models/Problem';
import { Progress } from '@/models/Progress';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import WorkspaceClient from './WorkspaceClient';
import { redirect } from 'next/navigation';

async function getUserWorkspaceData(userId: string) {
  await dbConnect();

  const [topics, patterns, problems] = await Promise.all([
    Topic.find({ userId }).sort({ order: 1 }).lean(),
    Pattern.find({ userId }).sort({ order: 1 }).lean(),
    Problem.find({ userId }).sort({ order: 1 }).lean(),
  ]);
  
  return {
    topics: JSON.parse(JSON.stringify(topics)),
    patterns: JSON.parse(JSON.stringify(patterns)),
    problems: JSON.parse(JSON.stringify(problems)),
  };
}

async function getUserProgress(userId: string) {
  await dbConnect();
  const progressDocs = await Progress.find({ userId }).lean();

  const progressMap: Record<string, { status: string; starred: boolean }> = {};
  progressDocs.forEach((p: any) => {
    progressMap[p.problemId.toString()] = {
      status: p.status,
      starred: !!p.starred,
    };
  });

  return progressMap;
}

export default async function WorkspacePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/login');
  }

  const userId = (session.user as any).id;

  const [{ topics, patterns, problems }, userProgress] = await Promise.all([
    getUserWorkspaceData(userId),
    getUserProgress(userId)
  ]);

  const problemsByPattern: Record<string, any[]> = {};
  problems.forEach((pr: any) => {
    const pid = pr.patternId.toString();
    if (!problemsByPattern[pid]) problemsByPattern[pid] = [];
    problemsByPattern[pid].push({
      id: pr._id.toString(),
      title: pr.title,
      url: pr.url,
      platform: pr.platform,
      status: userProgress[pr._id.toString()]?.status || 'todo',
      starred: userProgress[pr._id.toString()]?.starred || false,
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

  const data = topics.map((topic: any) => {
    const tid = topic._id.toString();
    return {
      id: tid,
      title: topic.title,
      resources: [],
      patterns: patternsByTopic[tid] || [],
    };
  });

  const totalProblems = problems.length;
  let solvedProblems = 0;
  problems.forEach((pr: any) => {
    if (userProgress[pr._id.toString()]?.status === 'solved') {
      solvedProblems++;
    }
  });

  return <WorkspaceClient data={data} totalProblems={totalProblems} solvedProblems={solvedProblems} />;
}
