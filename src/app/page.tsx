import Link from 'next/link';
import { BookOpen, RotateCcw, BarChart2, Brain, Users, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Complete DSA Sheet",
    desc: "823+ problems from Codeforces, LeetCode, and CSES — all parsed from the SMP Prep Doc.",
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: "Spaced Repetition",
    desc: "SM-2 algorithm schedules your reviews so you never forget what you've learned.",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Analytics Dashboard",
    desc: "Track your streaks, heatmaps, and progress across every topic.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Markdown Notes",
    desc: "Write and auto-save notes for every problem — right inside the tracker.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            SMP Skill Prep Doc — Now Interactive
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Sheet<span className="text-primary">Forge</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The ultimate DSA tracker built for SMP juniors. Track 823+ problems, revise smartly, and crush your internship OAs.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/sheet"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
            >
              View Sheet <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-2 border border-border bg-card px-8 py-3 rounded-xl font-semibold text-lg hover:bg-accent transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
