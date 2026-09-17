"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Brain, Check, X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviseClient({ initialDue }: { initialDue: any[] }) {
  const [cards, setCards] = useState(initialDue);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  const handleReview = async (problemId: string, memory: "forgot" | "hard" | "easy") => {
    // Optimistic UI
    setCards((prev) => prev.filter((p) => p.problem._id !== problemId));
    
    if (cards.length === 1) {
        setShowConfetti(true);
    }

    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, memory }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {showConfetti && (
           <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="text-8xl mb-8"
           >
             🎉
           </motion.div>
        )}
        <h2 className="text-3xl font-bold mb-4 text-emerald-500">You're all caught up!</h2>
        <p className="text-muted-foreground">Come back tomorrow for more spaced repetition.</p>
      </div>
    );
  }

  const current = cards[0];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      
      {/* Progress */}
      <div className="w-full mb-8">
         <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
               Daily Goal
            </span>
            <span className="font-bold text-primary">{initialDue.length - cards.length} / {initialDue.length}</span>
         </div>
         <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
               className="h-full bg-primary transition-all duration-500 ease-out"
               style={{ width: `${((initialDue.length - cards.length) / initialDue.length) * 100}%` }}
            />
         </div>
      </div>

      <div className="relative w-full h-[400px]">
        <AnimatePresence>
          {cards.length > 0 && (
            <Flashcard 
              key={current.card._id}
              data={current}
              onReview={handleReview}
              isFront={true}
            />
          )}
        </AnimatePresence>
        
        {/* Next Card Shadow */}
        {cards.length > 1 && (
            <div className="absolute top-4 left-4 right-4 bottom-[-16px] bg-card border rounded-3xl -z-10 shadow-sm opacity-50 scale-95" />
        )}
      </div>

    </div>
  );
}

function Flashcard({ data, onReview, isFront }: any) {
  const [flipped, setFlipped] = useState(false);
  const [exitX, setExitX] = useState(0);

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (offset > 100 || velocity > 500) {
      setExitX(200);
      onReview(data.problem._id, "easy");
    } else if (offset < -100 || velocity < -500) {
      setExitX(-200);
      onReview(data.problem._id, "forgot");
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ x: exitX, opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileDrag={{ scale: 1.05, rotate: exitX ? (exitX > 0 ? 5 : -5) : 0 }}
      className="absolute inset-0 bg-card border border-border/50 rounded-3xl shadow-xl flex flex-col p-8 cursor-grab active:cursor-grabbing backdrop-blur-xl bg-gradient-to-br from-card to-card/50"
      style={{ perspective: 1000 }}
    >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="uppercase text-xs font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-6">
                {data.problem.platform}
            </span>
            <h2 className="text-2xl font-bold mb-4 leading-tight">
                {data.problem.title}
            </h2>
            <a 
               href={data.problem.url} 
               target="_blank"
               className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm underline-offset-4 hover:underline"
            >
               View Problem <ExternalLink className="w-3 h-3" />
            </a>
        </div>

        <div className="mt-auto pt-6 border-t border-border/30">
            {!flipped ? (
                <button 
                  onClick={() => setFlipped(true)}
                  className="w-full py-4 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold flex items-center justify-center gap-2 transition"
                >
                   <Eye className="w-4 h-4" /> Show Notes
                </button>
            ) : (
                <div className="flex justify-between gap-3">
                   <button 
                     onClick={() => { setExitX(-200); onReview(data.problem._id, "forgot"); }}
                     className="flex-1 py-4 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition flex items-center justify-center gap-2"
                   >
                     <X className="w-4 h-4" /> Forgot
                   </button>
                   <button 
                     onClick={() => { setExitX(0); onReview(data.problem._id, "hard"); }}
                     className="flex-1 py-4 rounded-xl bg-yellow-500/10 text-yellow-500 font-bold hover:bg-yellow-500/20 transition flex items-center justify-center gap-2"
                   >
                     <Brain className="w-4 h-4" /> Hard
                   </button>
                   <button 
                     onClick={() => { setExitX(200); onReview(data.problem._id, "easy"); }}
                     className="flex-1 py-4 rounded-xl bg-green-500/10 text-green-500 font-bold hover:bg-green-500/20 transition flex items-center justify-center gap-2"
                   >
                     <Check className="w-4 h-4" /> Easy
                   </button>
                </div>
            )}
        </div>
    </motion.div>
  );
}
