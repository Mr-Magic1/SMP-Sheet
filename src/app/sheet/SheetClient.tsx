"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import StatusCycler from "@/components/StatusCycler";
import ProgressGraph from "@/components/ProgressGraph";
import {
  Video,
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  RefreshCw,
  Trash2,
  AlertTriangle,
  X,
  SlidersHorizontal,
  Hash,
  TrendingUp,
  StickyNote,
  Star,
} from "lucide-react";
import { toggleStarAction } from "@/actions/progress";
import { useProgressStore } from "@/store/progress";
import { useOptimisticProgressStore } from "@/store/optimistic";

type Problem = { id: string; title: string; url: string; platform: string; status: string; starred: boolean };
type Pattern = { id: string; title: string; problems: Problem[] };
type Resource = { id: string; kind: string; title: string; url: string };
type TopicData = { id: string; title: string; resources: Resource[]; patterns: Pattern[] };

/* ─── Platform config ─────────────────────────────── */
const PLATFORM_CONFIG: Record<string, { label: string; style: string }> = {
  leetcode:    { label: "LC",   style: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  codeforces:  { label: "CF",   style: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  cses:        { label: "CSES", style: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  usaco:       { label: "USACO",style: "bg-violet-500/15 text-violet-400 border border-violet-500/30" },
  interviewbit:{ label: "IB",   style: "bg-pink-500/15 text-pink-400 border border-pink-500/30" },
  atcoder:     { label: "AC",   style: "bg-red-500/15 text-red-400 border border-red-500/30" },
  gfg:         { label: "GFG",  style: "bg-green-600/15 text-green-400 border border-green-600/30" },
};


/* ─── Filter options ────────────────────────────────── */
type StatusFilter = "all" | "todo" | "attempting" | "stuck" | "solved";

const FILTER_OPTIONS: { id: StatusFilter; label: string; icon: React.ReactNode; activeClass: string; badgeClass: string }[] = [
  { id: "all",        label: "All",        icon: <SlidersHorizontal className="w-3.5 h-3.5" />, activeClass: "bg-primary text-primary-foreground border-primary",         badgeClass: "bg-white/20" },
  { id: "todo",       label: "To Do",      icon: <Circle className="w-3.5 h-3.5" />,            activeClass: "bg-muted-foreground text-background border-muted-foreground", badgeClass: "bg-white/20" },
  { id: "attempting", label: "Attempting", icon: <Clock className="w-3.5 h-3.5" />,             activeClass: "bg-yellow-500 text-black border-yellow-500",                  badgeClass: "bg-black/15" },
  { id: "stuck",      label: "Stuck",      icon: <XCircle className="w-3.5 h-3.5" />,           activeClass: "bg-red-500 text-white border-red-500",                       badgeClass: "bg-white/20" },
  { id: "solved",     label: "Solved",     icon: <CheckCircle2 className="w-3.5 h-3.5" />,      activeClass: "bg-green-500 text-white border-green-500",                   badgeClass: "bg-white/20" },
];

/* ─── ProblemRow ────────────────────────────────────── */
function ProblemRow({ problem, onDelete }: { problem: Problem; onDelete?: (id: string) => void }) {
  const { data: session } = useSession();
  const isGuest = !session?.user;
  const guestProgress = useProgressStore(s => s.progress);
  const setGuestProgress = useProgressStore(s => s.setProgress);
  
  const starredOverrides = useOptimisticProgressStore(s => s.starredOverrides);
  const setStarredOverride = useOptimisticProgressStore(s => s.setStarredOverride);
  const [isPending, startTransition] = useTransition();

  // Compute effective starred status
  let effStarred = problem.starred;
  if (isGuest && guestProgress[problem.id] && guestProgress[problem.id].starred !== undefined) {
    effStarred = guestProgress[problem.id].starred as boolean;
  } else if (!isGuest && starredOverrides[problem.id] !== undefined) {
    effStarred = starredOverrides[problem.id];
  }

  const handleStar = () => {
    const newStarred = !effStarred;
    if (isGuest) {
      const currentStatus = guestProgress[problem.id]?.status || 'todo';
      const difficultyFelt = guestProgress[problem.id]?.difficultyFelt;
      const usedEditorial = guestProgress[problem.id]?.usedEditorial;
      setGuestProgress(problem.id, currentStatus, difficultyFelt, usedEditorial, newStarred);
    } else {
      setStarredOverride(problem.id, newStarred);
      startTransition(() => {
        toggleStarAction(problem.id, newStarred).catch(console.error);
      });
    }
  };

  const pc = PLATFORM_CONFIG[problem.platform] ?? { label: problem.platform.slice(0, 4).toUpperCase(), style: "bg-muted text-muted-foreground border border-border" };

  return (
    <li className="group flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-accent/40 transition-all border border-transparent hover:border-border/50 min-w-0">
      {/* Status cycler */}
      <div className="flex-shrink-0">
        <StatusCycler problemId={problem.id} initialStatus={problem.status as any} />
      </div>

      {/* Title */}
      <a
        href={problem.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors group/link"
      >
        <span className="truncate">{problem.title}</span>
        <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-50 transition-opacity flex-shrink-0" />
      </a>

      {/* Right side: platform badge + notes */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notes link — always visible on mobile */}
        <Link
          href={`/notes/${problem.id}`}
          className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Open notes"
        >
          <StickyNote className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={handleStar}
          className={`p-1 rounded-md transition-colors ${
            effStarred ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10'
          }`}
          title={effStarred ? "Unstar question" : "Star question"}
        >
          <Star className="w-3.5 h-3.5" fill={effStarred ? "currentColor" : "none"} />
        </button>
        {onDelete && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(problem.id); }}
            className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-bold flex-shrink-0 ${pc.style}`}>
          {pc.label}
        </span>
      </div>
    </li>
  );
}

/* ─── PatternSection ────────────────────────────────── */
function PatternSection({ pattern, filter, onDeleteProblem }: { pattern: Pattern; filter: StatusFilter; onDeleteProblem?: (id: string) => void }) {
  const [open, setOpen] = useState(true);

  const displayProblems = useMemo(() =>
    filter === "all" ? pattern.problems : pattern.problems.filter(p => p.status === filter),
  [pattern.problems, filter]);

  const solved = pattern.problems.filter(p => p.status === "solved").length;
  const total  = pattern.problems.length;
  const pct    = total > 0 ? Math.round((solved / total) * 100) : 0;

  if (displayProblems.length === 0) return null;

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      {/* Pattern header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors gap-2 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {open
            ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          }
          <span className="font-semibold text-sm text-foreground truncate">{pattern.title}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">({total})</span>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {solved > 0 && (
            <span className="text-xs text-green-500 font-bold whitespace-nowrap">{solved}/{total}</span>
          )}
          <div className="w-14 sm:w-20 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </button>

      {/* Problems list */}
      {open && (
        <ul className="p-2 space-y-0.5">
          {displayProblems.map(problem => (
            <ProblemRow key={problem.id} problem={problem} onDelete={onDeleteProblem} />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── TopicCard ─────────────────────────────────────── */
function TopicCard({ topic, filter, onDeleteTopic, onDeleteProblem }: { topic: TopicData; filter: StatusFilter; onDeleteTopic?: (id: string) => void; onDeleteProblem?: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  const total      = topic.patterns.reduce((s, p) => s + p.problems.length, 0);
  const solved     = topic.patterns.reduce((s, p) => s + p.problems.filter(pr => pr.status === "solved").length, 0);
  const attempting = topic.patterns.reduce((s, p) => s + p.problems.filter(pr => pr.status === "attempting").length, 0);
  const stuck      = topic.patterns.reduce((s, p) => s + p.problems.filter(pr => pr.status === "stuck").length, 0);
  const pct        = total > 0 ? Math.round((solved / total) * 100) : 0;

  // When filter is active, hide topics with no matching problems
  const hasMatch = filter === "all" || topic.patterns.some(p => p.problems.some(pr => pr.status === filter));
  if (!hasMatch) return null;

  // Also hide topics with zero problems (topics like "STL" or "Linked Lists" may be empty after dedup)
  if (total === 0 && filter !== "all") return null;

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30">
      {/* Topic header button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
        className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 hover:bg-accent/20 transition-colors text-left cursor-pointer"
      >
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          open ? "bg-primary text-primary-foreground rotate-0" : "bg-muted/70 text-muted-foreground"
        }`}>
          {open
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />
          }
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground leading-tight">{topic.title}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {total} problems
            </span>
            {topic.resources.length > 0 && (
              <span className="text-xs text-muted-foreground">· {topic.resources.length} resources</span>
            )}
            {solved > 0 && (
              <span className="text-xs text-green-500 font-semibold">✓ {solved} solved</span>
            )}
            {attempting > 0 && (
              <span className="text-xs text-yellow-500 font-semibold">⏳ {attempting}</span>
            )}
            {stuck > 0 && (
              <span className="text-xs text-red-500 font-semibold">⚡ {stuck} stuck</span>
            )}
            {topic.resources.length > 0 && (
              <span className="text-xs text-muted-foreground">· {topic.resources.length} resources</span>
            )}
          </div>
        </div>

        {/* Progress indicator & Delete */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            {onDeleteTopic && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteTopic(topic.id); }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Delete topic"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <span className="text-sm font-bold text-primary tabular-nums hidden sm:inline">{pct}%</span>
          </div>
          <div className="w-24 md:w-32 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-border/60 px-4 sm:px-5 pb-5 space-y-3">
          {/* Mobile progress bar */}
          <div className="sm:hidden pt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-bold text-primary flex-shrink-0">{pct}%</span>
          </div>

          {/* Resources */}
          {topic.resources.filter(r => r.url && r.url !== '#').length > 0 && (
            <div className="mt-3 p-4 bg-primary/5 border border-primary/15 rounded-xl">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Study Resources
              </h3>
              <ul className="space-y-2">
                {topic.resources.filter(r => r.url && r.url !== '#').map((res) => (
                  <li key={res.id} className="flex items-start gap-2">
                    {res.kind === "video" || res.url?.includes('youtube') ? (
                      <Video className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    )}
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground hover:text-primary transition-colors flex-1 leading-snug"
                    >
                      {res.title}
                    </a>
                    <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Patterns */}
          <div className="space-y-2 mt-2">
            {topic.patterns
              .filter(p => {
                if (filter === "all") return p.problems.length > 0;
                return p.problems.some(pr => pr.status === filter);
              })
              .map((pattern) => (
                <PatternSection key={pattern.id} pattern={pattern} filter={filter} onDeleteProblem={onDeleteProblem} />
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main SheetClient ──────────────────────────────── */
export default function SheetClient({
  data,
  totalProblems,
  solvedProblems,
  onDeleteTopic,
  onDeleteProblem,
}: {
  data: TopicData[];
  totalProblems: number;
  solvedProblems: number; // passed from server, but we recalculate to be fully optimistic
  onDeleteTopic?: (id: string) => void;
  onDeleteProblem?: (id: string) => void;
}) {
  const { data: session } = useSession();
  const guestProgress = useProgressStore(s => s.progress);
  const overrides = useOptimisticProgressStore(s => s.overrides);
  const starredOverrides = useOptimisticProgressStore(s => s.starredOverrides);
  const isGuest = !session?.user;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentData = useMemo(() => {
    // If not mounted, just return server data to avoid hydration mismatch
    if (!mounted) return data;

    return data.map(topic => ({
      ...topic,
      patterns: topic.patterns.map(pat => ({
        ...pat,
        problems: pat.problems.map(pr => {
          let effStatus = pr.status;
          if (isGuest && guestProgress[pr.id]) {
            effStatus = guestProgress[pr.id].status;
          } else if (!isGuest && overrides[pr.id]) {
            effStatus = overrides[pr.id];
          }
          let effStarred = pr.starred;
          if (isGuest && guestProgress[pr.id] && guestProgress[pr.id].starred !== undefined) {
            effStarred = guestProgress[pr.id].starred as boolean;
          } else if (!isGuest && starredOverrides[pr.id] !== undefined) {
            effStarred = starredOverrides[pr.id];
          }
          return { ...pr, status: effStatus, starred: effStarred };
        })
      }))
    }));
  }, [data, mounted, isGuest, guestProgress, overrides, starredOverrides]);

  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<StatusFilter>("all");

  // Filter topics by search and status filter
  const filtered = useMemo(() => {
    let result = currentData;
    
    // Apply status filter if not "all"
    if (filter !== "all") {
      result = result.map(topic => ({
        ...topic,
        patterns: topic.patterns
          .map(pat => ({
            ...pat,
            problems: pat.problems.filter(p => p.status === filter)
          }))
          .filter(pat => pat.problems.length > 0)
      })).filter(topic => topic.patterns.length > 0);
    }
    
    // Apply search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result
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
        .filter(topic =>
          topic.patterns.length > 0 || topic.title.toLowerCase().includes(q)
        );
    }
    
    return result;
  }, [currentData, search, filter]);

  // Flatten all problems for graph + filter counts
  const allProblems = useMemo(() => {
    const arr: Problem[] = [];
    currentData.forEach(t => t.patterns.forEach(p => arr.push(...p.problems)));
    return arr;
  }, [currentData]);

  const filterCounts = useMemo(() => ({
    all:        allProblems.length,
    todo:       allProblems.filter(p => p.status === "todo").length,
    attempting: allProblems.filter(p => p.status === "attempting").length,
    stuck:      allProblems.filter(p => p.status === "stuck").length,
    solved:     allProblems.filter(p => p.status === "solved").length,
  }), [allProblems]);

  const actualSolvedProblems = filterCounts.solved;
  const pct = totalProblems > 0 ? Math.round((actualSolvedProblems / totalProblems) * 100) : 0;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 leading-tight">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              SMP Prep Sheet
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {totalProblems} unique problems · SMP Skill Prep Doc
            </p>
          </div>
        </div>

        {/* ── Overall progress ── */}
        <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <TrendingUp className="w-4 h-4 text-primary" />
                Overall Progress
              </span>
              <span className="text-sm font-bold text-primary tabular-nums">{actualSolvedProblems} / {totalProblems}</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-primary flex-shrink-0 tabular-nums">
            {pct}<span className="text-base sm:text-lg font-bold text-muted-foreground">%</span>
          </div>
        </div>

        {/* ── Progress Graph ── */}
        <ProgressGraph problems={allProblems} />

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Topics",    value: currentData.filter(t => t.patterns.some(p => p.problems.length > 0)).length, icon: <BookOpen className="w-4 h-4" />, colorClass: "text-primary bg-primary/8 border-primary/20" },
            { label: "Total",     value: totalProblems,                     icon: <Circle className="w-4 h-4" />,        colorClass: "text-foreground bg-card border-border" },
            { label: "Solved",    value: actualSolvedProblems,                    icon: <CheckCircle2 className="w-4 h-4" />,  colorClass: "text-green-500 bg-green-500/8 border-green-500/20" },
            { label: "Remaining", value: totalProblems - actualSolvedProblems,    icon: <Clock className="w-4 h-4" />,         colorClass: "text-yellow-500 bg-yellow-500/8 border-yellow-500/20" },
          ].map(stat => (
            <div key={stat.label} className={`border rounded-xl p-3 sm:p-4 flex flex-col gap-1.5 ${stat.colorClass}`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold opacity-75">
                {stat.icon}
                {stat.label}
              </div>
              <div className="text-2xl sm:text-3xl font-black tabular-nums">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ── Search + Filter ── */}
        <div className="space-y-2.5">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems, topics, platforms…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter chips - scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {FILTER_OPTIONS.map(opt => {
              const isActive = filter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border flex-shrink-0 ${
                    isActive
                      ? opt.activeClass
                      : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold min-w-[20px] text-center ${
                    isActive ? opt.badgeClass : "bg-muted"
                  }`}>
                    {filterCounts[opt.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Topics list ── */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-16 sm:py-20 text-muted-foreground">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-base sm:text-lg">No results for &ldquo;{search}&rdquo;</p>
              <p className="text-sm mt-1 opacity-70">Try a different search term</p>
            </div>
          ) : (
            filtered.map(topic => (
              <TopicCard key={topic.id} topic={topic} filter={filter} onDeleteTopic={onDeleteTopic} onDeleteProblem={onDeleteProblem} />
            ))
          )}
        </div>

        {/* Bottom padding for mobile nav */}
        <div className="h-4 md:h-2" />
      </div>
    </>
  );
}
