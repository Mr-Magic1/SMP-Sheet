import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Progress } from "@/models/Progress";
import { ActivityLog } from "@/models/ActivityLog";
import DashboardClient from "./DashboardClient";

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  await dbConnect();
  
  const user = await User.findById((session.user as any).id).lean();
  if (!user) {
    redirect("/auth/login");
  }

  const userId = user._id;

  // Get total local solved problems
  const solvedCount = await Progress.countDocuments({ userId, status: 'solved' });

  // Get activity logs for the heatmap
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 365);
  
  const rawLogs = await ActivityLog.find({
    userId,
    date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] }
  }).lean();

  const activityLogs = rawLogs.map(log => ({
    date: log.date,
    count: log.solvedCount
  }));

  // Remove private fields like password
  const cleanUser = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    handles: user.handles,
    streak: user.streak,
    level: user.level,
    xp: user.xp,
    settings: user.settings
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">
        Welcome back, <span className="text-primary">{user.name}</span> 👋
      </h1>
      
      <DashboardClient 
        user={cleanUser} 
        activityLogs={activityLogs} 
        localSolvedCount={solvedCount} 
      />
    </div>
  );
}
