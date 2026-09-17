import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Progress } from "@/models/Progress";
import { ActivityLog } from "@/models/ActivityLog";
import SyncButton from "@/components/SyncButton";
import PublicProfileToggle from "@/components/PublicProfileToggle";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  await dbConnect();
  
  const user = await User.findById((session.user as any).id).lean();
  if (!user) {
    redirect("/auth/login");
  }

  // Aggregate stats
  const progress = await Progress.find({ userId: user._id }).lean();
  
  const totalSolved = progress.filter(p => p.status === 'solved').length;
  const totalAttempting = progress.filter(p => p.status === 'attempting').length;
  const totalStuck = progress.filter(p => p.status === 'stuck').length;
  
  const totalTimeSpent = progress.reduce((acc, curr) => acc + (curr.timeSpentSec || 0), 0);
  const totalTimeHours = (totalTimeSpent / 3600).toFixed(1);

  const avgDifficulty = progress.length > 0 
    ? (progress.reduce((acc, curr) => acc + (curr.difficultyFelt || 0), 0) / progress.length).toFixed(1)
    : '0';

  const usedEditorialCount = progress.filter(p => p.usedEditorial).length;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile & Stats</h1>
        <PublicProfileToggle initialIsPublic={user.settings?.publicProfile || false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">XP Level</div>
          <div className="text-4xl font-bold text-primary">{user.level || 1}</div>
          <div className="text-xs text-muted-foreground mt-2">{user.xp || 0} Total XP</div>
        </div>
        
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
          <div className="text-4xl font-bold text-orange-500">{user.streak?.current || 0} 🔥</div>
          <div className="text-xs text-muted-foreground mt-2">Longest: {user.streak?.longest || 0}</div>
        </div>

        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Problems Solved</div>
          <div className="text-4xl font-bold text-green-500">{totalSolved}</div>
          <div className="text-xs text-muted-foreground mt-2">{totalAttempting} Attempting • {totalStuck} Stuck</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Detailed Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg bg-card shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Total Time Spent</span>
            <span className="font-medium">{totalTimeHours} hours</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Average Difficulty Felt</span>
            <span className="font-medium">{avgDifficulty} / 5</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Editorial Used Rate</span>
            <span className="font-medium">
              {progress.length ? Math.round((usedEditorialCount / progress.length) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="font-medium mb-4">Handle Links</h3>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span className="text-muted-foreground">LeetCode</span>
              <a href={user.handles?.leetcode ? `https://leetcode.com/u/${user.handles.leetcode}` : '#'} className="text-blue-500 hover:underline">
                {user.handles?.leetcode || 'Not linked'}
              </a>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Codeforces</span>
              <a href={user.handles?.codeforces ? `https://codeforces.com/profile/${user.handles.codeforces}` : '#'} className="text-blue-500 hover:underline">
                {user.handles?.codeforces || 'Not linked'}
              </a>
            </li>
          </ul>
          <SyncButton />
        </div>
      </div>
    </div>
  );
}
