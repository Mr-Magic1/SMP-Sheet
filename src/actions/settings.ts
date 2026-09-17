"use server";

import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function togglePublicProfileAction() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const userId = (session.user as any).id;
  const user = await User.findById(userId);

  if (user) {
    user.settings.publicProfile = !user.settings.publicProfile;
    await user.save();
    revalidatePath('/profile');
    return { success: true, publicProfile: user.settings.publicProfile };
  }
  
  return { success: false };
}
