"use client";

import React, { useEffect, useState } from "react";
import Heatmap from "@/components/Heatmap";
import { Activity, Code, Trophy, Star, Shield, Medal, GitBranch, Hash } from "lucide-react";

export default function DashboardClient({ 
  user, 
  activityLogs, 
  localSolvedCount 
}: { 
  user: any;
  activityLogs: { date: string; count: number }[];
  localSolvedCount: number;
}) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/sync')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(e => {
        console.error("Failed to fetch stats", e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Local SheetForge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-2xl bg-gradient-to-br from-card to-card/50 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> SheetForge Master
            </h2>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              {localSolvedCount}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Problems solved locally</p>
          </div>
        </div>
        <div className="p-6 border rounded-2xl bg-gradient-to-br from-card to-card/50 shadow-sm">
          <h2 className="text-lg font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" /> Current Streak
          </h2>
          <div className="text-5xl font-black text-orange-500">{user.streak?.current || 0} <span className="text-3xl">🔥</span></div>
          <p className="text-sm text-muted-foreground mt-2">Keep it up! Your daily goal is {user.settings?.dailyGoal || 3} problems.</p>
        </div>
        <div className="p-6 border rounded-2xl bg-gradient-to-br from-card to-card/50 shadow-sm flex flex-col">
          <h2 className="text-lg font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Local Level
          </h2>
          <div className="text-5xl font-black text-yellow-500">Lv {user.level || 1}</div>
          <p className="text-sm text-muted-foreground mt-2">{user.xp || 0} XP earned</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="p-6 border rounded-2xl bg-card shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-500" />
          Activity Heatmap
        </h2>
        <Heatmap logs={activityLogs} />
      </div>

      {/* External Platforms Bento Box */}
      <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2">
        <Code className="w-6 h-6 text-primary" />
        Codolio Hub
      </h2>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-6 border rounded-2xl bg-card animate-pulse h-40"></div>
          ))}
        </div>
      ) : stats?.error ? (
        <div className="p-6 border rounded-2xl bg-red-500/10 text-red-500">
          Failed to load external stats. Please check your handles in the profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* LeetCode */}
          {user.handles?.leetcode && stats.leetcode && (
            <PlatformCard 
              name="LeetCode" 
              handle={user.handles.leetcode}
              icon={<span className="text-yellow-600 font-bold text-xl">LC</span>}
              solved={stats.leetcode.solved} 
              rating={stats.leetcode.rating} 
              rank={stats.leetcode.rank}
              color="from-yellow-500/20 to-yellow-500/5 border-yellow-500/30"
            />
          )}

          {/* Codeforces */}
          {user.handles?.codeforces && stats.codeforces && (
            <PlatformCard 
              name="Codeforces" 
              handle={user.handles.codeforces}
              icon={<span className="text-red-500 font-bold text-xl">CF</span>}
              solved={stats.codeforces.solved} 
              rating={stats.codeforces.rating} 
              rank={stats.codeforces.rank}
              color="from-blue-500/20 to-red-500/5 border-blue-500/30"
            />
          )}

          {/* CodeChef */}
          {user.handles?.codechef && stats.codechef && (
            <PlatformCard 
              name="CodeChef" 
              handle={user.handles.codechef}
              icon={<span className="text-amber-700 font-bold text-xl">CC</span>}
              solved={stats.codechef.solved} 
              rating={stats.codechef.rating} 
              rank={stats.codechef.rank}
              color="from-amber-600/20 to-amber-900/5 border-amber-700/30"
            />
          )}

          {/* AtCoder */}
          {user.handles?.atcoder && stats.atcoder && (
            <PlatformCard 
              name="AtCoder" 
              handle={user.handles.atcoder}
              icon={<span className="text-black dark:text-white font-bold text-xl">AC</span>}
              solved={stats.atcoder.solved} 
              rating={stats.atcoder.rating} 
              rank={stats.atcoder.rank}
              color="from-gray-500/20 to-gray-500/5 border-gray-500/30"
            />
          )}

          {/* GFG */}
          {user.handles?.gfg && stats.gfg && (
            <PlatformCard 
              name="GeeksForGeeks" 
              handle={user.handles.gfg}
              icon={<span className="text-green-600 font-bold text-xl">GFG</span>}
              solved={stats.gfg.solved} 
              rating={stats.gfg.rating} 
              rank={stats.gfg.rank}
              color="from-green-500/20 to-green-500/5 border-green-500/30"
            />
          )}

          {/* GitHub */}
          {user.handles?.github && stats.github && (
            <PlatformCard 
              name="GitHub" 
              handle={user.handles.github}
              icon={<GitBranch className="w-6 h-6 text-foreground" />}
              solved={stats.github.solved} 
              rating={stats.github.rating} 
              rank={stats.github.rank}
              solvedLabel="Repos"
              ratingLabel="Followers"
              color="from-slate-500/20 to-slate-500/5 border-slate-500/30"
            />
          )}

        </div>
      )}
    </div>
  );
}

function PlatformCard({ name, handle, icon, solved, rating, rank, color, solvedLabel = "Solved", ratingLabel = "Rating" }: any) {
  return (
    <div className={`p-6 border rounded-2xl bg-gradient-to-br ${color} flex flex-col justify-between transition-all hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-lg shadow-sm">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-xs text-muted-foreground">@{handle}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-background/50 p-3 rounded-xl border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
             {solvedLabel}
          </p>
          <p className="text-2xl font-black">{solved}</p>
        </div>
        <div className="bg-background/50 p-3 rounded-xl border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
             {ratingLabel}
          </p>
          <p className="text-2xl font-black">{rating}</p>
        </div>
      </div>
      
      {rank && rank !== 'N/A' && (
        <div className="mt-4 text-sm font-semibold flex items-center gap-2">
          <Medal className="w-4 h-4 text-primary" /> {rank}
        </div>
      )}
    </div>
  );
}
