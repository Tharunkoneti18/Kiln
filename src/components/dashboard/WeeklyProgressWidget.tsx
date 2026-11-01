import React from 'react';
import { CalendarCheck, Flame } from 'lucide-react';
import type { WeeklyProgress } from '@/lib/career/dashboard-service';

export default function WeeklyProgressWidget({ progress }: { progress: WeeklyProgress }) {
  const remaining = Math.max(0, progress.budgetMinutes - progress.completedMinutes);

  return (
    <div className="bg-white rounded-3xl p-7 border border-[#DCE9E1] shadow-xs flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#557161]">
            <CalendarCheck className="w-4 h-4 text-[#206945]" />
            <span>Weekly Budget Ramp</span>
          </div>
          <span className="text-xs font-bold text-[#1B6342] bg-[#E8F5EE] px-2.5 py-0.5 rounded-full">
            {progress.completedMinutes} / {progress.budgetMinutes}m
          </span>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-4xl font-black text-[#13241A] tracking-tight">
              {progress.completionPercentage}%
            </span>
            <span className="text-xs text-[#6A8677] font-medium">
              {remaining > 0 ? `${remaining} mins to goal` : 'Goal achieved!'}
            </span>
          </div>

          {/* Organic Progress bar */}
          <div className="w-full h-3 rounded-full bg-[#EBF3EE] overflow-hidden p-0.5 border border-[#DEEBE2]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#206945] to-[#34A36B] transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(progress.completionPercentage, 4))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#EDF4F0] flex items-center justify-between text-xs text-[#526D5F]">
        <span className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-600" />
          Active sprint week 1
        </span>
        <span className="font-semibold text-[#1B6342]">On Schedule</span>
      </div>
    </div>
  );
}
