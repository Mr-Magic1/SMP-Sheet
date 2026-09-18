"use client";

import React, { useEffect, useState } from "react";
import Heatmap from "@/components/Heatmap";
import { Activity, Code, Trophy, Star, Shield, Medal, GitBranch, Hash } from "lucide-react";

import SyncButton from "@/components/SyncButton";
import PublicProfileToggle from "@/components/PublicProfileToggle";

export default function DashboardClient({ 
  user, 
  activityLogs, 
  localSolvedCount,
  analytics
}: { 
  user: any;
  activityLogs: { date: string; count: number }[];
  localSolvedCount: number;
  analytics: any;
}) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingHandles, setIsEditingHandles] = useState(false);
  const [handles, setHandles] = useState({
    leetcode: user.handles?.leetcode || "",
    codeforces: user.handles?.codeforces || "",
    codechef: user.handles?.codechef || "",
    github: user.handles?.github || "",
    atcoder: user.handles?.atcoder || "",
    gfg: user.handles?.gfg || ""
  });
  const [handlesForm, setHandlesForm] = useState(handles);
  const [savingHandles, setSavingHandles] = useState(false);

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
        <div className="p-6 border rounded-2xl bg-gradient-to-br from-card to-card/50 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Analytics
            </h2>
            <div className="text-sm space-y-1 mt-4">
              <div className="flex justify-between border-b border-border/50 pb-1">
                <span className="text-muted-foreground">Attempting</span>
                <span className="font-bold">{analytics.totalAttempting}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-1">
                <span className="text-muted-foreground">Stuck</span>
                <span className="font-bold">{analytics.totalStuck}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-1">
                <span className="text-muted-foreground">Time Spent</span>
                <span className="font-bold">{analytics.totalTimeHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Editorial Rate</span>
                <span className="font-bold">{analytics.editorialRate}%</span>
              </div>
            </div>
          </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 mb-4 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            Codolio Hub
          </h2>
          <button 
            onClick={() => setIsEditingHandles(true)}
            className="text-xs font-semibold px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
          >
            Edit Handles
          </button>
        </div>
        <div className="flex items-center gap-3">
          <SyncButton />
          <PublicProfileToggle initialIsPublic={user.settings?.publicProfile || false} />
        </div>
      </div>
      
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
      ) : !handles.leetcode && !handles.codeforces && !handles.codechef && !handles.atcoder && !handles.gfg && !handles.github ? (
        <div className="p-8 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-card">
          <Code className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
          <h3 className="font-bold text-lg">No Platforms Linked</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Track your ratings and solved counts from LeetCode, Codeforces, and more. Click Edit Handles to get started.
          </p>
          <button 
            onClick={() => setIsEditingHandles(true)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Handles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* LeetCode */}
          {handles.leetcode && stats.leetcode && (
            <PlatformCard 
              name="LeetCode" 
              handle={handles.leetcode}
              icon={<span className="text-yellow-600 font-bold text-xl">LC</span>}
              solved={stats.leetcode.solved} 
              rating={stats.leetcode.rating} 
              rank={stats.leetcode.rank}
              easy={stats.leetcode.easy}
              medium={stats.leetcode.medium}
              hard={stats.leetcode.hard}
              color="from-yellow-500/20 to-yellow-500/5 border-yellow-500/30"
              link={`https://leetcode.com/u/${user.handles.leetcode}`}
            />
          )}

          {/* Codeforces */}
          {handles.codeforces && stats.codeforces && (
            <PlatformCard 
              name="Codeforces" 
              handle={handles.codeforces}
              icon={<span className="text-red-500 font-bold text-xl">CF</span>}
              solved={stats.codeforces.solved} 
              rating={stats.codeforces.rating} 
              rank={stats.codeforces.rank}
              easy={stats.codeforces.easy}
              medium={stats.codeforces.medium}
              hard={stats.codeforces.hard}
              color="from-blue-500/20 to-red-500/5 border-blue-500/30"
              link={`https://codeforces.com/profile/${user.handles.codeforces}`}
            />
          )}

          {/* CodeChef */}
          {handles.codechef && stats.codechef && (
            <PlatformCard 
              name="CodeChef" 
              handle={handles.codechef}
              icon={<span className="text-amber-700 font-bold text-xl">CC</span>}
              solved={stats.codechef.solved} 
              rating={stats.codechef.rating} 
              rank={stats.codechef.rank}
              color="from-amber-600/20 to-amber-900/5 border-amber-700/30"
              link={`https://www.codechef.com/users/${user.handles.codechef}`}
            />
          )}

          {/* AtCoder */}
          {handles.atcoder && stats.atcoder && (
            <PlatformCard 
              name="AtCoder" 
              handle={handles.atcoder}
              icon={<span className="text-black dark:text-white font-bold text-xl">AC</span>}
              solved={stats.atcoder.solved} 
              rating={stats.atcoder.rating} 
              rank={stats.atcoder.rank}
              color="from-gray-500/20 to-gray-500/5 border-gray-500/30"
              link={`https://atcoder.jp/users/${user.handles.atcoder}`}
            />
          )}

          {/* GFG */}
          {handles.gfg && stats.gfg && (
            <PlatformCard 
              name="GeeksForGeeks" 
              handle={handles.gfg}
              icon={<span className="text-green-600 font-bold text-xl">GFG</span>}
              solved={stats.gfg.solved} 
              rating={stats.gfg.rating} 
              rank={stats.gfg.rank}
              color="from-green-500/20 to-green-500/5 border-green-500/30"
              link={`https://auth.geeksforgeeks.org/user/${user.handles.gfg}/practice/`}
            />
          )}

          {/* GitHub */}
          {handles.github && stats.github && (
            <PlatformCard 
              name="GitHub" 
              handle={handles.github}
              icon={<GitBranch className="w-6 h-6 text-foreground" />}
              solved={stats.github.solved} 
              rating={stats.github.rating} 
              rank={stats.github.rank}
              solvedLabel="Repos"
              ratingLabel="Followers"
              color="from-slate-500/20 to-slate-500/5 border-slate-500/30"
              link={`https://github.com/${user.handles.github}`}
            />
          )}

        </div>
      )}
      {/* Handles Form */}
      {isEditingHandles && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">Link Your Platforms</h3>
              <button onClick={() => setIsEditingHandles(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {Object.keys(handlesForm).map(key => (
                <div key={key}>
                  <label className="text-sm font-medium mb-1 block capitalize">{key}</label>
                  <input
                    type="text"
                    value={(handlesForm as any)[key]}
                    onChange={e => setHandlesForm({ ...handlesForm, [key]: e.target.value })}
                    placeholder={`${key} handle`}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-muted/30 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditingHandles(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setSavingHandles(true);
                  try {
                    const { updateHandlesAction } = await import("@/actions/sync");
                    await updateHandlesAction(handlesForm);
                    setHandles(handlesForm);
                    setIsEditingHandles(false);
                    // Refresh stats
                    setLoading(true);
                    const res = await fetch('/api/user/sync');
                    const data = await res.json();
                    setStats(data);
                    setLoading(false);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSavingHandles(false);
                  }
                }}
                disabled={savingHandles}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {savingHandles ? "Saving..." : "Save Handles"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformCard({ name, handle, icon, solved, rating, rank, easy, medium, hard, color, solvedLabel = "Solved", ratingLabel = "Rating", link }: any) {
  const hasDifficultyStats = easy !== undefined || medium !== undefined || hard !== undefined;

  const CardContent = (
    <div className={`p-6 border rounded-2xl bg-gradient-to-br ${color} flex flex-col justify-between transition-all hover:scale-[1.02] h-full cursor-pointer`}>
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
      
      {hasDifficultyStats && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
          {easy !== undefined && (
            <div className="flex-1 bg-green-500/10 text-green-500 rounded-lg p-2 text-center border border-green-500/20">
              <span className="block opacity-70 text-[10px] uppercase">Easy</span>
              <span className="text-sm font-bold">{easy}</span>
            </div>
          )}
          {medium !== undefined && (
            <div className="flex-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-lg p-2 text-center border border-yellow-500/20">
              <span className="block opacity-70 text-[10px] uppercase">Medium</span>
              <span className="text-sm font-bold">{medium}</span>
            </div>
          )}
          {hard !== undefined && (
            <div className="flex-1 bg-red-500/10 text-red-500 rounded-lg p-2 text-center border border-red-500/20">
              <span className="block opacity-70 text-[10px] uppercase">Hard</span>
              <span className="text-sm font-bold">{hard}</span>
            </div>
          )}
        </div>
      )}

      {rank && rank !== 'N/A' && (
        <div className="mt-4 text-sm font-semibold flex items-center gap-2">
          <Medal className="w-4 h-4 text-primary" /> {rank}
        </div>
      )}
    </div>
  );

  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block h-full">
      {CardContent}
    </a>
  ) : CardContent;
}
