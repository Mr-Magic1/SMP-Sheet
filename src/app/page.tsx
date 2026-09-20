import Link from 'next/link';
import { BookOpen, BarChart2, Brain, ArrowRight, Code, Trophy, Sparkles, ExternalLink, FileText } from 'lucide-react';

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Complete DSA Sheet",
    desc: "728+ unique problems from Codeforces, LeetCode, and CSES — all curated for SMP.",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500"
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Analytics Dashboard",
    desc: "Track your streaks, heatmaps, and progress across every topic effortlessly.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500"
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Interactive Markdown Notes",
    desc: "Write rich text notes with bold, italic, code blocks directly inside the tracker.",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-500"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden flex-grow flex items-center pt-20 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 text-sm font-semibold text-primary mb-8 shadow-sm backdrop-blur-md transition-transform hover:scale-105">
            <Sparkles className="w-4 h-4" />
            <span>SMP Skill Prep Doc — Now Interactive</span>
          </div>

          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-6">
            Prep<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Tracker</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            The ultimate DSA tracker built for MNNIT juniors. Track 728+ unique problems, revise smartly, and crush your internship OAs.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
            <Link
              href="/sheet"
              className="group flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            >
              View Sheet <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-2 border-2 border-border bg-card/50 backdrop-blur-sm px-8 py-4 rounded-2xl font-bold text-lg hover:bg-accent hover:border-primary/50 transition-all"
            >
              Create Account
            </Link>
            <a
              href="/resources/SMP%20Skill%20Prep%20Doc.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border-2 border-blue-500/50 text-blue-500 bg-blue-500/10 backdrop-blur-sm px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-500/20 transition-all"
            >
              <FileText className="w-5 h-5" /> View Original Doc
            </a>
          </div>
        </div>
      </section>

      {/* Features Bento Box */}
      <section className="container mx-auto px-4 pb-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`p-8 bg-gradient-to-br ${f.color} border border-border/50 rounded-3xl hover:border-primary/40 hover:shadow-xl transition-all duration-300 group backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150" />
              <div className={`w-14 h-14 bg-background rounded-2xl flex items-center justify-center ${f.iconColor} mb-6 shadow-sm`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-2xl mb-3">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Credits */}
      <footer className="mt-auto border-t border-border/50 bg-card/30 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 mb-2">
              Motilal Nehru National Institute of Technology (MNNIT)
            </h2>
            <p className="text-muted-foreground text-lg">
              This sheet is created by SMP mentors for juniors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center sm:text-left">
            {/* Creators */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center justify-center sm:justify-start gap-2">
                <Code className="w-5 h-5 text-primary" /> Created & Maintained By
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="https://www.linkedin.com/in/krishna-mittal-0b1964323/" target="_blank" className="hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-2">Krishna Mittal <ExternalLink className="w-3 h-3"/></a></li>
                <li><a href="https://www.linkedin.com/in/sachit-jain-4214b530a/" target="_blank" className="hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-2">Sachit Jain <ExternalLink className="w-3 h-3"/></a></li>
                <li><a href="https://www.linkedin.com/in/rudranshpratapsingh/" target="_blank" className="hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-2">Rudransh Pratap Singh <ExternalLink className="w-3 h-3"/></a></li>
              </ul>
              <p className="text-xs font-medium text-primary bg-primary/10 inline-block px-2 py-1 rounded-md">Pre-Final Year SMP Mentors, Batch of '28</p>
            </div>

            {/* OG Mentors */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center justify-center sm:justify-start gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Under Guidance Of
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="https://www.linkedin.com/in/ashish-jha-57151628b/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors flex items-center justify-center sm:justify-start gap-2">Ashish Jha <ExternalLink className="w-3 h-3"/></a></li>
                <li><a href="https://www.linkedin.com/in/debopriyo-sen-mnnit2027/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors flex items-center justify-center sm:justify-start gap-2">Debopriyo Sen <ExternalLink className="w-3 h-3"/></a></li>
                <li><a href="https://www.linkedin.com/in/harsh-sharma-310134298/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors flex items-center justify-center sm:justify-start gap-2">Harsh Sharma <ExternalLink className="w-3 h-3"/></a></li>
              </ul>
              <p className="text-xs font-medium text-yellow-500 bg-yellow-500/10 inline-block px-2 py-1 rounded-md">The OG People, Batch of '27</p>
            </div>

            {/* Developer */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center justify-center sm:justify-start gap-2">
                <Brain className="w-5 h-5 text-purple-500" /> UI & Development
              </h3>
              <div className="text-muted-foreground">
                <a 
                  href="https://www.linkedin.com/in/kailash-vishwakarma-932732310/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-purple-500 transition-colors font-medium flex items-center justify-center sm:justify-start gap-2 text-lg mb-2"
                >
                  Kailash Vishwakarma <ExternalLink className="w-4 h-4"/>
                </a>
                <p className="text-xs font-medium text-purple-500 bg-purple-500/10 inline-block px-2 py-1 rounded-md mt-1">Batch of '29</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <p>© {new Date().getFullYear()} PrepTracker MNNIT.</p>
            <p className="text-xs opacity-70">
              Note: Mentors and Alumni, please update your placeholder LinkedIn URLs in the source code!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
