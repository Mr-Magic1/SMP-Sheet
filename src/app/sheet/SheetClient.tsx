"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import StatusCycler from "@/components/StatusCycler";
import { Video, FileText, ChevronDown, ChevronRight, ExternalLink, Search, BookOpen, CheckCircle2, Circle } from "lucide-react";

type Problem = { id: string; title: string; url: string; platform: string; status: string };
type Pattern = { id: string; title: string; problems: Problem[] };
type Resource = { id: string; kind: string; title: string; url: string };
type TopicData = { id: string; title: string; resources: Resource[]; patterns: Pattern[] };

const PLATFORM_STYLES: Record<string, string> = {
  leetcode: "bg-amber-500/15 text-amber-500 border border-amber-500/30",
  codeforces: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  cses: "bg-green-500/15 text-green-500 border border-green-500/30",
  usaco: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  interviewbit: "bg-pink-500/15 text-pink-400 border border-pink-500/30",
  other: "bg-muted text-muted-foreground border border-border",
};

const PLATFORM_ICONS: Record<string, string> = {
  leetcode: "LC",
  codeforces: "CF",
  cses: "CSES",
  usaco: "USACO",
  interviewbit: "IB",
  other: "EXT",
};

const STATUS_STYLES: Record<string, string> = {
  todo: "text-muted-foreground",
  attempting: "text-yellow-500",
  stuck: "text-red-500",
  solved: "text-green-500",
};

function ProblemRow({ problem }: { problem: Problem }) {
  return (
    <li className="group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border">
      <div className="flex items-center gap-3 min-w-0">
        <StatusCycler problemId={problem.id} initialStatus={problem.status as any} />
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate flex items-center gap-1 group/link"
        >
          {problem.title}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-60 transition-opacity flex-shrink-0" />
        </a>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/notes/${problem.id}`}
          className="text-xs text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity underline underline-offset-2"
        >
          Notes
        </Link>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 ${PLATFORM_STYLES[problem.platform] || PLATFORM_STYLES.other}`}>
          {PLATFORM_ICONS[problem.platform] || problem.platform}
        </span>
      </div>
    </li>
  );
}

function PatternSection({ pattern, defaultOpen }: { pattern: Pattern; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  const solved = pattern.problems.filter(p => p.status === "solved").length;

  if (pattern.problems.length === 0) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <span className="font-medium text-sm">{pattern.title}</span>
          <span className="text-xs text-muted-foreground">({pattern.problems.length})</span>
        </div>
        {solved > 0 && (
          <span className="text-xs text-green-500 font-semibold">{solved}/{pattern.problems.length} solved</span>
        )}
      </button>
      {open && (
        <ul className="p-2 space-y-0.5">
          {pattern.problems.map(problem => (
            <ProblemRow key={problem.id} problem={problem} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TopicCard({ topic }: { topic: TopicData }) {
  const [open, setOpen] = useState(false);
  const totalProblems = topic.patterns.reduce((sum, p) => sum + p.problems.length, 0);
  const solved = topic.patterns.reduce((sum, p) => sum + p.problems.filter(pr => pr.status === "solved").length, 0);
  const pct = totalProblems > 0 ? Math.round((solved / totalProblems) * 100) : 0;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Topic header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          {open ? (
            <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
          <div>
            <h2 className="text-lg font-bold text-foreground">{topic.title}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-muted-foreground">{totalProblems} problems</span>
              {topic.resources.length > 0 && (
                <span className="text-xs text-muted-foreground">· {topic.resources.length} resources</span>
              )}
              {solved > 0 && (
                <span className="text-xs text-green-500 font-semibold">· {solved} solved</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border">
          {/* Resources */}
          {topic.resources.length > 0 && (
            <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                📚 Preparation Resources
              </h3>
              <ul className="space-y-1.5">
                {topic.resources.map((res) => (
                  <li key={res.id} className="flex items-center gap-2">
                    {res.kind === "video" ? (
                      <Video className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    )}
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-foreground hover:text-primary hover:underline transition-colors line-clamp-1"
                    >
                      {res.title}
                    </a>
                    <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Patterns */}
          <div className="space-y-2 mt-2">
            {topic.patterns.filter(p => p.problems.length > 0).map((pattern, i) => (
              <PatternSection key={pattern.id} pattern={pattern} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SheetClient({
  data,
  totalProblems,
  solvedProblems,
}: {
  data: TopicData[];
  totalProblems: number;
  solvedProblems: number;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data
      .map(topic => ({
        ...topic,
        patterns: topic.patterns
          .map(pat => ({
            ...pat,
            problems: pat.problems.filter(
              p => p.title.toLowerCase().includes(q) || p.platform.includes(q)
            ),
          }))
          .filter(pat => pat.problems.length > 0),
      }))
      .filter(topic => topic.patterns.length > 0 || topic.title.toLowerCase().includes(q));
  }, [data, search]);

  const pct = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          SMP Prep Sheet
        </h1>
        <p className="text-muted-foreground mt-1">All questions organised from the SMP Skill Prep Doc</p>

        {/* Overall progress */}
        <div className="mt-4 flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold text-primary">{solvedProblems} / {totalProblems}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div className="text-2xl font-black text-green-500">{pct}%</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search problems, topics, platforms…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Topics", value: data.length, icon: <BookOpen className="w-4 h-4" /> },
          { label: "Problems", value: totalProblems, icon: <Circle className="w-4 h-4" /> },
          { label: "Solved", value: solvedProblems, icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
              {stat.icon}
              {stat.label}
            </div>
            <div className="text-2xl font-black">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div className="space-y-3">
        {filtered.map(topic => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No results for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
