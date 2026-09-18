"use client";
import React from "react";
import { format, subDays, startOfWeek, addDays, getDay } from "date-fns";

export default function Heatmap({ logs }: { logs: { date: string; count: number }[] }) {
  // Generate last 365 days
  const today = new Date();
  const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 0 }); // Start on Sunday
  
  const days = [];
  let curr = startDate;
  
  const logMap = new Map(logs.map(l => [l.date, l.count]));

  while (curr <= today) {
    const dateStr = format(curr, "yyyy-MM-dd");
    days.push({
      date: curr,
      dateStr,
      count: logMap.get(dateStr) || 0,
    });
    curr = addDays(curr, 1);
  }

  // Pad the start so it always aligns to Sunday (0)
  const firstDayIndex = getDay(days[0].date);
  for (let i = 0; i < firstDayIndex; i++) {
    days.unshift({ date: subDays(days[0].date, 1), dateStr: "", count: -1 }); // Dummy
  }

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count < 0) return "bg-transparent"; // Dummy
    if (count === 0) return "bg-muted/30";
    if (count < 2) return "bg-emerald-300 dark:bg-emerald-900";
    if (count < 5) return "bg-emerald-400 dark:bg-emerald-700";
    if (count < 10) return "bg-emerald-500 dark:bg-emerald-500";
    return "bg-emerald-600 dark:bg-emerald-400";
  };

  // Calculate month labels
  const monthLabels = [];
  let currentMonth = -1;
  let colsInMonth = 0;
  
  weeks.forEach((week) => {
    // Find the first valid day in the week to get the month
    const validDay = week.find(d => d.count !== -1);
    if (!validDay) return;
    
    const weekMonth = validDay.date.getMonth();
    
    if (weekMonth !== currentMonth) {
      if (currentMonth !== -1) {
        monthLabels.push({ label: format(new Date(2000, currentMonth, 1), "MMM"), cols: colsInMonth });
      }
      currentMonth = weekMonth;
      colsInMonth = 1;
    } else {
      colsInMonth++;
    }
  });
  if (currentMonth !== -1) {
    monthLabels.push({ label: format(new Date(2000, currentMonth, 1), "MMM"), cols: colsInMonth });
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex text-xs text-muted-foreground mb-2 pl-4">
        {monthLabels.map((m, i) => (
          <div key={i} style={{ width: `${m.cols * 16}px` }} className="flex-shrink-0">
            {m.label}
          </div>
        ))}
      </div>
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1 w-3">
            {week.map((day, j) => (
              <div
                key={j}
                title={day.count >= 0 ? `${day.count} problems on ${day.dateStr}` : ""}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors hover:ring-1 hover:ring-primary`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex text-xs text-muted-foreground mt-2 justify-between min-w-max w-full max-w-full">
        <span>Less</span>
        <div className="flex gap-1 items-center mx-2">
            <div className="w-3 h-3 rounded-sm bg-muted/30"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-900"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-400"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
