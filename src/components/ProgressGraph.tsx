"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

export default function ProgressGraph({ problems }: { problems: any[] }) {
  const data = useMemo(() => {
    let todo = 0, attempting = 0, stuck = 0, solved = 0;
    
    problems.forEach(p => {
      if (p.status === 'solved') solved++;
      else if (p.status === 'attempting') attempting++;
      else if (p.status === 'stuck') stuck++;
      else todo++;
    });

    return [
      { name: "Solved", value: solved, color: "#10b981" },    // Emerald-500
      { name: "Attempting", value: attempting, color: "#eab308" }, // Yellow-500
      { name: "Stuck", value: stuck, color: "#ef4444" },       // Red-500
      { name: "Todo", value: todo, color: "#6b7280" },         // Gray-500
    ].filter(d => d.value > 0);
  }, [problems]);

  if (problems.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl text-sm font-medium">
          <p style={{ color: payload[0].payload.color }}>
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 border border-border rounded-2xl bg-card shadow-sm grid md:grid-cols-2 gap-8 items-center"
    >
      <div>
        <h2 className="text-xl font-bold mb-1">Your Progress</h2>
        <p className="text-sm text-muted-foreground mb-6">
          A complete overview of your sheet status.
        </p>
        
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <span className="font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-64 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className="text-3xl font-black">{problems.length}</span>
           <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total</span>
        </div>
      </div>
    </motion.div>
  );
}
