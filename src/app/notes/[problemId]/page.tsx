import dbConnect from "@/lib/db";
import { Note } from "@/models/Note";
import { Problem } from "@/models/Problem";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";

export default async function NotePage({ params }: { params: Promise<{ problemId: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  await dbConnect();
  
  const problem = await Problem.findById(resolvedParams.problemId).lean();
  if (!problem) {
    return <div>Problem not found</div>;
  }

  const userId = (session.user as any).id;
  const note = await Note.findOne({ userId, problemId: resolvedParams.problemId }).lean();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Notes: {problem.title}</h1>
      <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-8 block">
        View Problem
      </a>
      
      <NoteEditor 
        problemId={resolvedParams.problemId} 
        initialBodyMd={note?.bodyMd || ""} 
        initialSnippets={note?.snippets || []} 
      />
    </div>
  );
}
