"use server";

import dbConnect from "@/lib/db";
import { Note } from "@/models/Note";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveNoteAction(
  problemId: string,
  bodyMd: string,
  snippets: { language: string; code: string; label: string }[]
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const userId = (session.user as any).id;

  await Note.findOneAndUpdate(
    { userId, problemId },
    {
      bodyMd,
      snippets
    },
    { upsert: true }
  );

  revalidatePath(`/notes/${problemId}`);
  return { success: true };
}
