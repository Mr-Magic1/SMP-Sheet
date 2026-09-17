import dbConnect from "@/lib/db";
import { RevisionCard } from "@/models/RevisionCard";
import { Problem } from "@/models/Problem";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReviseClient from "./ReviseClient";
import { Sparkles } from "lucide-react";

export const revalidate = 0;

export default async function RevisePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  await dbConnect();
  const userId = (session.user as any).id;

  // Find cards due today or earlier
  const now = new Date();
  const dueCards = await RevisionCard.find({
    userId,
    dueDate: { $lte: now }
  }).lean();

  const problemIds = dueCards.map(c => c.problemId);
  const problems = await Problem.find({ _id: { $in: problemIds } }).lean();

  const dueProblems = dueCards.map(card => {
    const p = problems.find(prob => prob._id.toString() === card.problemId.toString());
    return {
      card: { ...card, _id: card._id.toString(), problemId: card.problemId.toString(), userId: card.userId.toString() },
      problem: p ? { ...p, _id: p._id.toString(), patternId: p.patternId.toString() } : null
    };
  }).filter(dp => dp.problem); // remove if problem somehow missing

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
         <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Spaced Repetition
         </h1>
         <p className="text-muted-foreground mt-3 text-lg">Swipe your way to coding mastery.</p>
      </div>

      <ReviseClient initialDue={dueProblems} />
    </div>
  );
}
